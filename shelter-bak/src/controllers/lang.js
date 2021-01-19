const langDb = require('../services/lang-db');
const {writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.LANG');

module.exports = {
    /**
     * Get all available languages
     * Returns: all available languages
     */
    async getLangs(req, res) {
        try {
            log.debug('controller getLangs', );
            const result = await langDb.getLangs();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * add or update language
     * Returns: Resulted id
     */
    async upsetLang(req, res) {
        try {
            log.debug('controller upsetLang', req.swagger.params.lang.value);
            const id = await langDb.upsetLang(req.swagger.params.lang.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * delete language
     * Returns: Resulted id
     */
    async deleteLang(req, res) {
        try {
            log.debug('controller deleteLang', req.swagger.params.lang.value);
            const id = await langDb.deleteLang(req.swagger.params.lang.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },

};
