const votesDb = require('../services/votes');
const {writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.LANG');

module.exports = {
    /**
     * To vote
     * Returns: all available languages
     */
    async vote(req, res) {
        try {
            log.debug('controller vote', );
            const resId = req.swagger.params.resId.value;
            const clientId = req.swagger.params['x-client-id'].value;
            const {value, voteId} = req.swagger.params.body.value;
            const id = await votesDb.vote(resId, clientId, value, voteId);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * get Votes to resource
     * Returns: Resulted id
     */
    async getVotes(req, res) {
        try {
            log.debug('controller getVotes');
            const resId = req.swagger.params.resId.value;
            const clientId = req.swagger.params['x-client-id'].value;
            const result = await votesDb.getVotes(resId, clientId);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * add comment
     * Returns: Resulted id
     */
    async addComment(req, res) {
        try {
            log.debug('controller addComment');
            const resId = req.swagger.params.resId.value;
            const clientId = req.swagger.params['x-client-id'].value;
            const {comment,nickName,commentId} = req.swagger.params.body.value;
            const id = await votesDb.addComment(resId, clientId, comment, nickName, commentId);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * update comment
     * @returns {Promise<void>}
     */
    async updateComment(req, res) {
        try {
            const resId = req.swagger.params.resId.value;
            const clientId = req.swagger.params['x-client-id'].value;
            const {comment,commentId} = req.swagger.params.body.value;
            log.debug('controller updateComment resource: %s, comment %s', resId, commentId);
            await votesDb.updateComment(commentId, clientId, comment);
            writeResponse(res, {commentId}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * get all comments to resource
     * @returns {Promise<void>}
     */
    async getComments(req, res) {
        try {
            log.debug('controller getComments');
            const resId = req.swagger.params.resId.value;
            const clientId = req.swagger.params['x-client-id'].value;
            const commentId = req.swagger.params.commentId.value;
            const from = req.swagger.params.from.value;
            const size = req.swagger.params.size.value;
            const result = await votesDb.getComments(resId, commentId, from, size, clientId);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },

};
