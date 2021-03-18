const {writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.LOG');

module.exports = {
    writeLog(req, res) {
        try {
            const client = (req.swagger.params['x-client-id'] || {}).value;
            const event = (req.swagger.params.body || {}).value;
            if (event) {
                event.clientId = client;
                log.debug(event);
            }
            writeResponse(res, 'Ok', req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    }
};