const browser = require('./services/brousers');
const log = require('./log').getLogger('rest-utils');

class HttpCodeError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.code = code;
        this.details = details;
    }
    getCode() {
        return this.code;
    }
    getDetails() {
        return this.details;
    }
}
function getClientId(req) {
    const forwardedFor = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const remoteIP = (forwardedFor || 'unknown').split(',')[0];
    let clientId = undefined;
    if (req && req.headers['x-client-id']) {
        clientId = req.headers['x-client-id'];
        browser.updateId(clientId, remoteIP);
    } else {
        clientId = browser.newId(remoteIP);
    }
    log.debug('link browserId %s to %s', clientId, forwardedFor);
    return clientId;
}
function writeResponse(res, payload, req) {
    let clientId = getClientId(req);
    let code = 200;
    let details = {};
    res.writeHead(code, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Client-ID': clientId});
    const body = {data: payload, status:{code, message: 'successful', details}};
    res.end(JSON.stringify(body));
    log.debug('response: %o', body);
}
function writeResponseError(res, err, req) {
    let clientId = getClientId(req);
    let code = 500;
    let details = {};
    if(err && typeof err.getCode === 'function') {
        code = err.getCode();
        details = err.getDetails();
    }
    res.writeHead(code, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'X-Client-ID': clientId});
    const body = {status: code, details, message: err.message};
    res.end(JSON.stringify(body));
    log.error('response: %o', body);
}

module.exports = {HttpCodeError, writeResponseError, writeResponse};
