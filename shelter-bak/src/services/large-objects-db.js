const pgPool = require('../db/pg-pool');
const esPool = require('../db/es-pool');
const { LargeObjectManager } = require('pg-large-object');
const { chain } = require('stream-chain');

const log = require('../log').getLogger('SERVICE.LARGE-OBJECTS');
const {HttpCodeError} = require('../rest-utils');

const bufferSize = 16384;
const noDataTimeout = 5000;
class LargeObjectsDb {
    async getInfo(id) {
        let result = await pgPool.query('select id, original_name as "originalName", encoding, mimetype as "mimeType", size, created from storage_lob where id = $1', [id]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `LargeObject [${id}] not found`);
        }
        return result.rows[0];
    }
    /**
     * Get stored resource by id
     * id
     * "foobar"
     */
    async read(id) {
        log.debug('read', id);
        const client = await pgPool.getClient();
        try {
            const loMan = new LargeObjectManager({pg: client.client});
            await client.startTransaction();
            const [size, stream] = await loMan.openAndReadableStreamAsync(id, bufferSize);
            log.info('[%s] large object opened', id);
            const result = new Promise((resolve, reject) => {
                stream.on('end', ()=>{
                    client.commit();
                    resolve(Number.parseInt(size));
                }).on('close', ()=>{
                    client.commit();
                    resolve(Number.parseInt(size));
                }).on('error', (err)=>{
                    client.commit();
                    reject(err);
                });
            });
            return { stream, result };
        } catch (err) {
            log.error('read:[%s] failed to open, %s', id, err);
            throw err;
        }
    }
    /**
     * Upload file
     * uploadFile
     * "foobar"
     */
    async upload(uploadFile, comment) {
        const client = await pgPool.getClient();
        try{
            const loMan = new LargeObjectManager({pg: client.client});
            await client.query('BEGIN');
            let [id, loStream] = await loMan.createAndWritableStreamAsync(bufferSize);
            log.debug(`Assign id:${id} to ${uploadFile.originalname}`);
            let count = 0;
            const stream = chain([
                data => {
                    count += data.length;
                    return data;
                },
                loStream
            ]);
            id = id.toString();
            log.debug('[%s] large object created', id);
            const result = new Promise((resolve, reject) => {
                let timeoutHandler = setTimeout(() => {
                    if (count === 0) {
                        log.error('[%s] transmission did not start', id);
                        reject(new HttpCodeError(408, `[${id}] transmission did not start`));
                    }
                }, noDataTimeout);
                loStream.on('finish', () => {
                    log.debug('[%s] finished', id);
                    resolve();
                }).on('close', () => {
                    log.info('[%s] closed', id);
                    resolve();
                }).on('error', err => {
                    log.error('[%s] error, %s', id, err);
                    reject(err);
                }).on('data', ()=> {
                    log.debug('[%s] received data', id);
                    clearTimeout(timeoutHandler);
                });
            }).then(()=>{
                return client.query(
                    'insert into public.storage_lob(id, original_name, encoding, mimetype, size, comment) values ($1,$2,$3,$4,$5,$6)',
                    [id, uploadFile.originalname, uploadFile.encoding, uploadFile.mimetype, uploadFile.size, comment]);
            }). then(()=>{
                return client.commit();
            }). then(()=>{
                const d = new Date();
                return esPool.putAsset({
                    id, comment, originalName: uploadFile.originalname, mimeType: uploadFile.mimetype,
                    size: uploadFile.size, created: d.toISOString()
                });
            }).then(() => {
                log.debug('[%s] written %s bytes', id, count);
                return count;
            }).catch(err => {
                log.error('[%s] transmission failed, %s', id, err);
                client.rollback();
                throw err;
            });
            return {id, stream, result};
        } catch (e) {
            log.error('failed to create, %s', e);
            await client.rollback();
            throw e;
        }
    }
    /**
     * Get all info about stored resources
     *
     *
     */
    async getFiles() {
        log.debug('getFiles');
        let result = await pgPool.query(`SELECT
             s.id, original_name as "originalName", encoding, mimetype as "mimeType", size, created, comment,
             COALESCE(n.num, 0) as "numberOfReferences"
         FROM storage_lob s
                  left join (
             SELECT id, SUM(num) as num FROM (
                 SELECT '' as id, 0 as num
                 UNION
                 SELECT id_asset as id, COUNT(*) as num FROM page_attachment group by id_asset
                 UNION
                 SELECT id_asset as id, COUNT(*) as num FROM banner group by id_asset
                 UNION
                 SELECT id_asset as id, COUNT(*) as num FROM pet_asset group by id_asset
             ) c
             GROUP BY id
         ) n on s.id = n.id`);
        return result.rows.map(v => {v.numberOfReferences *= 1; return v;});
    }
    /**
     * Get info about stored resource by id
     * id
     * "foobar"
     */
    async getFile(id) {
        log.debug('getFile ' + id);
        let file = await pgPool.query(`WITH data as (SELECT CAST($1 as VARCHAR) as id)
            SELECT
                s.id, original_name as "originalName", encoding, mimetype as "mimeType", size, created, comment,
                n.num as "numberOfReferences"
            FROM storage_lob s, data d,
                 (
                     SELECT SUM(num) as num FROM
                         (
                             SELECT COUNT(*) as num FROM page_attachment WHERE id_asset in (SELECT id FROM data)
                             UNION
                             SELECT COUNT(*) as num FROM banner WHERE id_asset in (SELECT id FROM data)
                             UNION
                             SELECT COUNT(*) as num FROM pet_asset WHERE id_asset in (SELECT id FROM data)
                         ) c
                 ) n
            WHERE s.id = d.id`, [id]);

        let references = await pgPool.query(`WITH data as (SELECT CAST($1 as VARCHAR) as id)
        SELECT 'page' as "refType", id_page as "refId", tooltip as "refName" FROM page_attachment, data d WHERE id_asset = d.id
        UNION
        SELECT 'banner' as "refType", banner.id as "refId", tooltip as "refName" FROM banner, data d WHERE id_asset = d.id
        UNION
        SELECT 'pet' as "refType", id_pet as "refId", tooltip as "refName" FROM pet_asset, data d WHERE id_asset = d.id`, [id]);

        if(file.rowCount === 0) {
            throw new HttpCodeError(404, `LargeObject [${id}] not found`);
        }
        return {file: file.rows.map(v => {v.numberOfReferences *= 1; return v;})[0], references: pgPool.clearNull(references.rows)};
    }
    /**
     * Delete lerge object by id
     * id
     * "foobar"
     */
    async deleteFile(id) {
        let result;
        log.debug('deleteFile ' + id);
        result = await pgPool.query('DELETE FROM storage_lob WHERE id = $1', [id]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `LargeObject [${id}] not found`);
        }
        return id;
    }
    async update(id, comment) {
        log.debug('update %s', id);
        let result = await pgPool.query('update storage_lob set comment = $2 where id = $1 returning *', [id, comment]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `LargeObject [${id}] not found`);
        }
        const r = result.rows[0];
        await esPool.putAsset({
            id: r.id, comment: r.comment, originalName: r.originalname, mimeType: r.mimetype, size: r.size, created: r.created
        });
        return id;
    }
}

const largeObjectsDb = new LargeObjectsDb();
module.exports = largeObjectsDb;
