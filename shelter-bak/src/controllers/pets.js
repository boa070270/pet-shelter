const petsDb = require('../services/pets-db');
const {writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.PETS');

module.exports = {
    /**
     * Get fields
     * Returns: fields
     */
    async getFields(req, res) {
        try {
            log.debug('controller getFields', );
            const result = await petsDb.getFields();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * add field
     * Returns: Resulted id
     */
    async addField(req, res) {
        try {
            const field = req.swagger.params.field.value;
            log.debug('controller addField', field);
            const id = await petsDb.addField(field.field, field.titles);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * delete a field
     * Returns: Resulted id
     */
    async deleteField(req, res) {
        try {
            log.debug('controller deleteField', req.swagger.params.id.value);
            const id = await petsDb.deleteField(req.swagger.params.id.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Get all pets
     * Returns: pet available
     */
    async getPets(req, res) {
        try {
            log.debug('controller getPets', );
            const result = await petsDb.getPets();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * add pet
     * Returns: Resulted id
     */
    async addPet(req, res) {
        try {
            log.debug('controller addPet', req.swagger.params.pet.value);
            const id = await petsDb.addPet(req.swagger.params.pet.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * update pet
     * Returns: Resulted id
     */
    async updatePet(req, res) {
        try {
            log.debug('controller updatePet', req.swagger.params.pet.value);
            const id = await petsDb.updatePet(req.swagger.params.pet.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Get one pet
     * Returns: pet available
     */
    async getPet(req, res) {
        try {
            log.debug('controller getPet', req.swagger.params.id.value);
            const result = await petsDb.getPet(req.swagger.params.id.value);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * delete a pet
     * Returns: Resulted id
     */
    async deletePet(req, res) {
        try {
            log.debug('controller deletePet', req.swagger.params.id.value);
            const id = await petsDb.deletePet(req.swagger.params.id.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },

};
