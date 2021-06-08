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
     * delete ds
     * name
     * "ds1"
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

    async getDsData(ds) {
        let data;
        let fields;
        log.debug('getDsData %o', ds);
        data = await pgPool.query('select data from ds_data where ds = $1', [ds]);
        fields = await pgPool.query('select field, type from ds_fld where ds = $1', [ds]);
        return {ds, fields: pgPool.clearNull(fields), data: pgPool.clearNull(data.rows)};
    }

    async addDsData(ds) {
        log.debug('addDsData %o', ds);
        await this.checkData(ds);
        let id = await pgPool.query('insert into ds_data(ds, data) VALUES ($1, $2) returning ctid', [ds.ds, ds.data]);
        return id.rows;
    }

    async checkData(ds) {
        let fields = (await this.getFields(ds.ds)).fields;
        if (!fields || fields.length === 0) {
            throw new Error(`No fields found in ds ${ds.ds}`);
        }
        for (const field of fields) {
            if (typeof ds.data[field.field] !== field.type) {
                throw new Error(`Data field ${field.field} has type ${typeof ds.data[field.field]} but expected to be ${field.type}`);
            }
        }
    }

    /**
     *
     * @param ds
     * @param old = {id: no pk, field_name: field_value for pk}
     */
    async updateDsData(ds, old) {
        let condition;
        log.debug('updateDsData %o, %o', ds, old);
        await this.checkData(ds);
        if (old.id) {
            condition = {sql: 'ctid = $2', val: old.id};
        } else {
            condition = {sql: 'data @> $2', val: JSON.stringify(old)};
        }
        let id = await pgPool.query(`update ds_data set data = $1 where ${condition.sql} returning ctid`, [ds.data, condition.val]);
        return id.rows;
    }

    /**
     *
     * @param old = {id: no pk, field_name: field_value for pk}
     */
    async deleteDsData(old) {
        let condition;
        log.debug('deleteDsData %o', old);
        if (old.id) {
            condition = {sql: 'ctid = $1', val: old.id};
        } else {
            condition = {sql: 'data @> $1', val: JSON.stringify(old)};
        }
        let id = await pgPool.query(`delete from ds_data where ${condition.sql} returning CTID`, [condition.val]);
        return id.rows;
    }
}

const dsDb = new DsDb();
module.exports = dsDb;
