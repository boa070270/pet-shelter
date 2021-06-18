const menuDb = require('../services/menu-db');
const {writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.MENU');

module.exports = {
    /**
     * Get all menu
     * Returns: all menu
     */
    async getMenus(req, res) {
        try {
            log.debug('controller getMenus', );
            const result = await menuDb.getMenus();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * upset menu
     * Returns: the path
     */
    async upsetMenu(req, res) {
        try {
            const menu = req.swagger.params.menu.value;
            log.debug('controller upsetMenu', menu);
            const id = await menuDb.upsetMenu(menu.menu, menu.titles);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Get menu
     * Returns: all menu
     */
    async getMenu(req, res) {
        try {
            log.debug('controller getMenu', req.swagger.params.path.value);
            const result = await menuDb.getMenu(req.swagger.params.path.value);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * delete menu
     * Returns: the path
     */
    async deleteMenu(req, res) {
        try {
            log.debug('controller deleteMenu', req.swagger.params.path.value, req.swagger.params.force.value);
            const id = await menuDb.deleteMenu(req.swagger.params.path.value, req.swagger.params.force.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },

};
