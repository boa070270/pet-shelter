const bannerDb = require('../services/banner-db');
const {writeResponseError, writeResponse} = require('../rest-utils');
const log = require('../log').getLogger('CONTROLLER.BANNER');

module.exports = {
    /**
     * Get ids of images/media to carousel as banner
     * Returns: banners available
     */
    async getCarousel(req, res) {
        try {
            log.debug('controller getCarousel', req.swagger.params.resource.value, req.swagger.params.lang.value, req.swagger.params.count.value, req.swagger.params.offset.value);
            let result = await bannerDb.getCarousel(req.swagger.params.resource.value, req.swagger.params.lang.value, req.swagger.params.count.value, req.swagger.params.offset.value);
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * Get banners
     * Returns: banners available
     */
    async getBanners(req, res) {
        try {
            log.debug('controller getBanners', );
            let result = await bannerDb.getBanners();
            writeResponse(res, result, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * add banner
     * Returns: Resulted id
     */
    async addBanner(req, res) {
        try {
            log.debug('controller addBanner', req.swagger.params.banner.value);
            const id = await bannerDb.addBanner(req.swagger.params.banner.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * update banner
     * Returns: Resulted id
     */
    async updateBanner(req, res) {
        try {
            log.debug('controller updateBanner', req.swagger.params.banner.value);
            const id = await bannerDb.updateBanner(req.swagger.params.banner.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },
    /**
     * delete banner
     * Returns: Resulted id
     */
    async deleteBanner(req, res) {
        try {
            log.debug('controller deleteBanner', req.swagger.params.id.value);
            const id = await bannerDb.deleteBanner(req.swagger.params.id.value);
            writeResponse(res, {id}, req);
        } catch (err) {
            log.error(err);
            writeResponseError(res, err, req);
        }
    },

};
