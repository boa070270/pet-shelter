const pgPool = require('../db/pg-pool');
const esPool = require('../db/es-pool');
const log = require('../log').getLogger('SERVICE.PETS');
const {HttpCodeError} = require('../rest-utils');

class PetsDb {
    /**
     * Get fields
     *
     *
     */
    async getFields() {
        log.debug('getFields with query "select name, type, subtype from pets_fields"');
        let fields = await pgPool.query('select name, type, subtype, enum_values as "enumValues", fld_order as "order" from pets_fields');
        log.debug('getFields with query "select name, lang, title from field_titles"');
        let titles = await pgPool.query('select name as id, lang, title from field_titles', []);
        return {fields: pgPool.clearNull(fields.rows), titles:pgPool.clearNull(titles.rows)};
    }
    /**
     * add field
     * field
     * {"titles":[{"id":"about","lang":"en","title":"About us"},{"id":"about","lang":"en","title":"About us"}]}
     */
    async addField(field, titles) {
        log.debug('1. UPDATE pets_fields');
        await pgPool.query(`WITH data as ( SELECT 
                      CAST($1 as VARCHAR) as name, 
                      CAST($2 as VARCHAR) as type, 
                      CAST($3 as VARCHAR) as subtype, 
                      CAST($4 as VARCHAR) as enum_values,
                      CAST($5 as INTEGER) as fld_order
        ), upd as ( 
            UPDATE pets_fields f SET 
            type = d.type, subtype = d.subtype, enum_values = d.enum_values, fld_order = d.fld_order
            FROM data d WHERE f.name = d.name RETURNING f.name
        ) 
        INSERT INTO pets_fields(name, type, subtype, enum_values) 
        SELECT name, type, subtype, enum_values FROM data WHERE NOT EXISTS (SELECT * FROM upd)`,
        [field.name, field.type, field.subtype, field.enumValues, field.order]);
        log.debug('2.DELETE FROM field_titles WHERE name = :fields.name');
        await pgPool.query('DELETE FROM field_titles WHERE name = $1', [field.name]);
        log.debug('3. INSERT INTO field_titles');
        if(titles) {
            for (const {lang, title} of titles.titles) {
                await pgPool.query(`INSERT INTO field_titles(name, lang, title)
                                             VALUES ($1, $2, $3)`,
                [field.name, lang, title]);
            }
        }
        return field.name;
    }
    /**
     * delete a field
     * id
     * "foobar"
     */
    async deleteField(id) {
        let result;
        log.debug(`deleteField: ${id}`);
        result = await pgPool.query(`WITH data as (
            SELECT CAST($1 as VARCHAR) as name
        ), del1 as (
            DELETE FROM pets_fields WHERE name in (SELECT name FROM data)
        ) DELETE FROM field_titles WHERE name in (SELECT name FROM data)`, [id]);
        if(result.rowCount > 0) {
            return id;
        }
        throw new HttpCodeError(404, `Field [${id}] not found`);
    }
    /**
     * Get all pets
     *
     *
     */
    async getPets() {
        const result = [];
        log.debug('getPets with query "SELECT id_pet as id, name, value FROM pets_info ORDER BY id_pet"');
        let pets = await pgPool.query(`SELECT id, name, value
                                    FROM pets p LEFT JOIN pets_info pi on p.id = pi.id_pet
                                    ORDER BY id`);
        let last = {};
        for(const p of pets.rows) {
            if(p.id !== last.id) {
                last = {
                    id: p.id,
                    fields: [{name: p.name, value: p.value}],
                    ref: []
                };
                result.push(last);
            } else {
                last.fields.push({name: p.name, value: p.value});
            }
        }
        log.debug('getPets with query "SELECT s.id as refId, id_pet as "targetUrl", s.mimetype as "mimeType", p.tooltip FROM pet_asset p, storage_lob s ORDER BY id_pet"');
        let refs = await pgPool.query('SELECT s.id as "refId", id_pet as "targetUrl", s.mimetype as "mimeType", p.tooltip FROM pet_asset p, storage_lob s WHERE s.id = p.id_asset ORDER BY id_pet', []);
        last = {};
        for(const r of refs.rows) {
            if(r.targetUrl !== last.id) {
                last = result.find(v => v.id === r.targetUrl);
                if(last) {
                    last.ref.push({refId:r.refId, targetUrl: r.targetUrl, mimeType: r.mimeType, tooltip: r.tooltip});
                }
            } else {
                last.ref.push({refId:r.refId, targetUrl: r.targetUrl, mimeType: r.mimeType, tooltip: r.tooltip});
            }
        }
        return result;
    }
    /**
     * add pet
     * pet
     * {"id":"foo","fields":[{"name":"foo","value":"foo"},{"name":"foo","value":"foo"}],"ref":[{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"},{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"}]}
     */
    async addPet(pet) {
        pet.id = await pgPool.genSequence();
        log.debug('1. INSERT INTO pets(id) VALUES(:pet.id)');
        const res = await pgPool.query('INSERT INTO pets(id) VALUES($1) returning created', [pet.id]);
        pet.created = res.rows[0].created.toISOString();
        return this.updatePet(pet, false);
    }
    /**
     * update pet
     * pet
     * {"id":"foo","fields":[{"name":"foo","value":"foo"},{"name":"foo","value":"foo"}],"ref":[{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"},{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"}]}
     */
    async updatePet(pet, check = true) {
        if(check) {
            let result = pgPool.query('UPDATE pets SET modified = now() WHERE id = $1', [pet.id]);
            if (result.rowCount === 0) {
                throw new HttpCodeError(404, `Pet [${pet.id}] don found`);
            }
        }
        log.debug('1. DELETE FROM pets_info WHERE id_pet = :pet.id');
        await pgPool.query('DELETE FROM pets_info WHERE id_pet = $1', [pet.id]);
        if(pet.fields) {
            log.debug('1. insert into pets_info(id_pet, name, value) VALUES(:pet.id, :pet.fields[0].name, :pet.fields[0].value)');
            for(const {name, value} of pet.fields) {
                await pgPool.query('insert into pets_info(id_pet, name, value) VALUES($1, $2, $3)', [pet.id, name, value]);
            }
        }
        log.debug('1. DELETE FROM pet_asset WHERE id_pet = :pet.id');
        await pgPool.query('DELETE FROM pet_asset WHERE id_pet = $1', [pet.id]);
        log.debug('1. insert into pet_asset(id_pet, id_asset, tooltip) VALUES(:pet.id, :pet.ref[0].id_asset, :pet.ref[0].tooltip)');
        if(pet.ref) {
            for(const {refId, tooltip} of pet.ref) {
                await pgPool.query('insert into pet_asset(id_pet, id_asset, tooltip) VALUES($1, $2, $3)', [pet.id, refId, tooltip]);
            }
        }
        await esPool.putPet(pet);
        return pet.id;
    }
    /**
     * Get one pet
     * id
     * "foobar"
     */
    async getPet(id) {
        const res = await pgPool.query('select id, created, modified from pets where id = $1', [id]);
        if(res.rowCount === 0) {
            throw new HttpCodeError(404, `Pet id:${id} not found`);
        }
        log.debug('getPet with query "SELECT id_pet, name, value FROM pets_info WHERE id_pet = :id"');
        const fields = await pgPool.query('SELECT name, value FROM pets_info WHERE id_pet = $1', [id]);
        log.debug('getPet with query "SELECT s.id as "refId", id_pet as "targetUrl", s.mimetype as "mimeType", p.tooltip FROM pet_asset p, storage_lob s WHERE id_pet = :id"');
        const ref = await pgPool.query('SELECT s.id as "refId", id_pet as "targetUrl", s.mimetype as "mimeType", p.tooltip FROM pet_asset p, storage_lob s WHERE p.id_asset = s.id AND id_pet = $1', [id]);
        const result = Object.assign({}, res.rows[0]);
        result.fields = pgPool.clearNull(fields.rows);
        result.ref = pgPool.clearNull(ref.rows);
        return result;
    }
    /**
     * delete a pet
     * id
     * "foobar"
     */
    async deletePet(id) {
        let result;
        log.debug('deletePet with query "delete from pets where id = :id"');
        result = await pgPool.query('delete from pets where id = $1', [id]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `Pet id:${id} not found`);
        }
        await esPool.delPet(id);
        return id;
    }

}

const petsDb = new PetsDb();
module.exports = petsDb;
