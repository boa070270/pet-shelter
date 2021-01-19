const usersDb = require('../services/users-db');
const {HttpCodeError, writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.USERS');

module.exports = {
    /**
     * Get users
     * Returns: all pages
     */
    async getUsers(req, res) {
        try {
            log.debug('controller getUsers', );
            const result = await usersDb.getUsers();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * add user
     * Returns: Resulted id
     */
    async addUser(req, res) {
        try {
            log.debug('controller addUser', req.swagger.params.user.value);
            const id = await usersDb.addUser(req.swagger.params.user.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * update user
     * Returns: Resulted id
     */
    async updateUser(req, res) {
        try {
            log.debug('controller updateUser', req.swagger.params.user.value);
            const id = await usersDb.updateUser(req.swagger.params.user.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * delete user
     * Returns: Resulted id
     */
    async deleteUser(req, res) {
        try {
            log.debug('controller deleteUser', req.swagger.params.login.value);
            const id = await usersDb.deleteUser(req.swagger.params.login.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * return info about user
     * @param req
     * @returns {Promise<void>}
     */
    async login(req, res) {
        //we already have this info attached by request
        if (req.authorized) {
            writeResponse(res, req.authorized, req);
        } else {
            writeResponseError(res, new HttpCodeError(401, 'Unauthorized'), req);
        }
    }
};
