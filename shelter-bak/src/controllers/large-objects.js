const largeObjectsDb = require('../services/large-objects-db');
const log = require('../log').getLogger('CONTROLLER.LARGE-OBJECTS');
const {writeResponseError, writeResponse} = require('../rest-utils');

module.exports = {
    /**
     * Get stored resource by id
     * Returns: assets
     */
    async read(req, res) {
        try {
            let id = req.swagger.params.id.value;
            log.debug('controller read', id);
            let info = await largeObjectsDb.getInfo(id);
            log.debug('Try obtain %o', info);
            res.writeHead(200, {'Content-Type': info.mimeType, 'Last-Modified': info.created});
            let {stream, result} = await largeObjectsDb.read(id);
            result
                .then(bytesRead => log.debug('Successful read %s, size: %s', id, bytesRead))
                .catch(err => log.debug('Failure read %s, error: %s', id, err));
            stream.pipe(res);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Upload file
     * Returns: Resulted id
     */
    async upload(req, res) {
        try {
            let uploadFile = req.swagger.params.upfile.value;
            let comment = req.swagger.params.comment.value;
            log.debug('controller upload %s %s', uploadFile.originalname, comment);
            const {id, stream, result} = await largeObjectsDb.upload(uploadFile, comment);
            const buffer = uploadFile.buffer;
            stream.write(buffer);
            stream.end();
            let bytesWritten = await result;
            log.debug('Successful store %s, size: %s', id, bytesWritten);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Get all info about stored resources
     * Returns: banners available
     */
    async getFiles(req, res) {
        try {
            log.debug('controller getFiles', );
            const result = await largeObjectsDb.getFiles();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Get info about stored resource by id
     * Returns: banners available
     */
    async getFile(req, res) {
        try {
            log.debug('controller getFile', req.swagger.params.id.value);
            const result = await largeObjectsDb.getFile(req.swagger.params.id.value);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Delete large object by id
     * Returns: id resource
     */
    async deleteFile(req, res) {
        try {
            log.debug('controller deleteFile', req.swagger.params.id.value);
            const id = await largeObjectsDb.deleteFile(req.swagger.params.id.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },

};
