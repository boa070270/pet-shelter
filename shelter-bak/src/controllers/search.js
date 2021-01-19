const searchDb = require('../services/search-db');
const {writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.SEARCH');

module.exports = {
    /**
     * Search by all site
     * Returns: result of search
     */
    async search(req, res) {
        try {
            log.debug('controller search', req.swagger.params.index.value, req.swagger.params.lang.value, req.swagger.params.query.value, req.swagger.params.size.value, req.swagger.params.from.value);
            const result = await searchDb.search(req.swagger.params.index.value, req.swagger.params.lang.value, req.swagger.params.query.value, req.swagger.params.size.value, req.swagger.params.from.value);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Search pet
     * Returns: result of search
     */
    async searchPet(req, res) {
        try {
            log.debug('controller search-pet', req.swagger.params.query.value, req.swagger.params.size.value, req.swagger.params.from.value);
            const result = await searchDb.searchPet(req.swagger.params.query.value, req.swagger.params.size.value, req.swagger.params.from.value);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err);
        }
    },

};
