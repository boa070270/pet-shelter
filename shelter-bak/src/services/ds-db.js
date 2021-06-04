const pgPool = require('../db/pg-pool');
const {HttpCodeError} = require('../rest-utils');
const log = require('../log').getLogger('SERVICE.DS');

class DsDb {
    /**
     * Get all available datasources
     *
     *
     */
    async getDs() {
        let result;
        log.debug('getDs');
        result = await pgPool.query('select name, description from ds', []);
        return pgPool.clearNull(result.rows);
    }
    /**
     * Get all available fields
     *
     * {ds, fields:[]}
     */
    async getFields(ds) {
        let result;
        log.debug('getFields %o', ds);
        result = await pgPool.query('select field, pk, type from ds_fld WHERE ds = $1', [ds]);
        return {ds, fields: pgPool.clearNull(result.rows)};
    }
    /**
     * Get all available fields
     *
     * {ds, fields:[]}
     */
    async getAllFields() {
        let result;
        log.debug('getAllFields');
        result = await pgPool.query('select ds, field, pk, type from ds_fld', []);
        let arr = pgPool.clearNull(result.rows);
        result = [];
        while (arr.length > 0) {
            let o = {ds: arr[0].ds};
            o.fields = arr.filter(f => f.ds === o.ds);
            arr = arr.filter(f => f.ds !== o.ds);
            o.fields.forEach(v => delete v.ds);
            result.push(o);
        }
        return result;
    }
    /**
     * add or update datasources
     * ds
     * {"name":"en","description":{...}, fields:[{field:"f1",pk:false,type:"string"}]}
     */
    async addDs(name, description, fields) {
        log.debug('addDs %o, %o, %o', name, description, fields);
        await pgPool.query('insert into ds(name, description) VALUES ($1, $2)',
            [name, description]);
        const e = this.extend(fields);
        await pgPool.query('insert into ds_fld(ds, field, pk, type) VALUES' + e.vals.substr(1),
            [name, ...e.array]);
        return name;
    }
    extend(fields, startAt = 2) {
        let i = startAt;
        let vals = '';
        let array = [];
        for (const f of fields) {
            vals += `, ($1, $${i++}, $${i++}, $${i++})`;
            array.push(f.field, f.pk, f.type);
        }
        return {vals, array};
    }
    /**
     * delete language
     * lang
     * "foobar"
     */
    async deleteDs(name) {
        let result;
        log.debug('deleteDs %s', name);
        await pgPool.query('delete from ds_data where ds = $1', [name]);
        await pgPool.query('delete from ds_fld where ds = $1', [name]);
        result = await pgPool.query('delete from ds where name = $1', [name]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `Ds [${name}] not found`);
        }
        return name;
    }
}

const dsDb = new DsDb();
module.exports = dsDb;
