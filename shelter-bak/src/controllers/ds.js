const dsDb = require('../services/ds-db');
const {writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.DS');

module.exports = {
    /**
     * Get ds
     * Returns: ds array
     */
    async getDs(req, res) {
        try {
            log.debug('controller getDs', );
            const result = await dsDb.getDs();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Get fields
     * Returns: fields
     */
    async getFields(req, res) {
        try {
            const ds = req.swagger.params.name.value;
            log.debug('controller getFields %o', ds);
            const result = await dsDb.getFields(ds);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Get all fields
     * Returns: fields
     */
    async getAllFields(req, res) {
        try {
            log.debug('controller getAllFields');
            const result = await dsDb.getAllFields();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * add ds
     * Returns: Resulted id
     */
    async addDs(req, res) {
        try {
            const ds = req.swagger.params.ds.value;
            log.debug('controller addDs %o', ds);
            const id = await dsDb.addDs(ds.ds, ds.description, ds.fields);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * delete ds
     * Returns: Resulted id
     */
    async deleteDs(req, res) {
        try {
            log.debug('controller deleteField %o', req.swagger.params.name.value);
            const id = await dsDb.deleteDs(req.swagger.params.name.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Get data
     * Returns: ds data array
     */
    async getDsData(req, res) {
        try {
            const ds = req.swagger.params.ds.value;
            log.debug('controller getDsData %o', ds);
            const result = await dsDb.getDsData(ds);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * add data
     * Returns: Resulted id
     */
    async addDsData(req, res) {
        try {
            const ds = req.swagger.params.ds.value;
            log.debug('controller addDsData %o', ds);
            const id = await dsDb.addDsData(ds);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * update data
     * Returns: Resulted id
     */
    async updateDsData(req, res) {
        try {
            const ds = req.swagger.params.ds.value;
            log.debug('controller updateDsData %o, %o', ds.ds, ds.filter);
            const id = await dsDb.updateDsData(ds.ds, ds.filter);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * delete data
     * Returns: Resulted id
     */
    async deleteDsData(req, res) {
        try {
            const ds = req.swagger.params.ds.value;
            const data = req.swagger.params.data.value;
            log.debug('controller deleteField %o, %o', ds, data);
            const id = await dsDb.deleteDsData(ds, data);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    }

};
