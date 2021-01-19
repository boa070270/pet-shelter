const pagesDb = require('../services/pages-db');
const {writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.PAGES');

module.exports = {
    /**
     * Get pages
     * Returns: all pages
     */
    async getPages(req, res) {
        try {
            log.debug('controller getPages', );
            const result = await pagesDb.getPages();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * add page
     * Returns: Resulted id
     */
    async addPage(req, res) {
        try {
            log.debug('controller addPage', req.swagger.params.page.value);
            const id = await pagesDb.addPage(req.swagger.params.page.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * update page
     * Returns: Resulted id
     */
    async updatePage(req, res) {
        try {
            let page = req.swagger.params.page.value;
            log.debug('controller updatePage', page);
            const id = await pagesDb.updatePage(page);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * get page
     * Returns: Resulted id
     */
    async getPage(req, res) {
        try {
            log.debug('controller getPage', req.swagger.params.id.value);
            const result = await pagesDb.getPage(req.swagger.params.id.value);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * get page
     * Returns: Resulted id
     */
    async getPageMenu(req, res) {
        try {
            log.debug('controller getPageMenu', req.swagger.params.menuId.value);
            const result = await pagesDb.getPageMenu(req.swagger.params.menuId.value);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * delete page
     * Returns: Resulted id
     */
    async deletePage(req, res) {
        try {
            log.debug('controller deletePage', req.swagger.params.id.value);
            const id = await pagesDb.deletePage(req.swagger.params.id.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },

};
