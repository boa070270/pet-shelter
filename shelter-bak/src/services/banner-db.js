const pgPool = require('../db/pg-pool');
const {HttpCodeError} = require('../rest-utils');
const log = require('../log').getLogger('SERVICE.BANNER');

class BannerDb {
    /**
     * Get ids of images/media to carousel as banner
     * resource,lang,count,offset
     * "foobar"
     * 0
     * "foobar"
     */
    async getCarousel(resource,lang = null,count = 3,offset = 0) {
        log.debug('getCarousel %o', {resource, lang, count, offset});
        let result;
        switch (resource) {
        case 'banner' :
            result = await pgPool.query('SELECT \'banner\' as resource, b.id_asset as "assetId", b.target_url as "targetUrl", b.tooltip, s.mimetype as "mimeType" FROM banner b, storage_lob s WHERE b.id_asset = s.id and (b.lang = coalesce($1,b.lang) or b.lang is null) ORDER BY b.score OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY', [lang, offset, count]);
            break;
        case 'page':
            result = await pgPool.query('SELECT \'page\' as resource, a.id_asset as "assetId", a.id_page as "targetUrl", a.tooltip, s.mimetype as "mimeType" FROM page_attachment a, storage_lob s, pages p WHERE a.id_asset = s.id and (p.lang = coalesce($1,p.lang) or p.lang is null) and p.id = a.id_page ORDER BY p.score, p.created desc OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY', [lang, offset, count]);
            break;
        case 'pet':
            result = await pgPool.query('SELECT \'pet\' as resource, p.id_asset as "assetId", p.id_pet as "targetUrl", p.tooltip, s.mimetype as "mimeType" FROM pet_asset p, storage_lob s WHERE p.id_asset = s.id OFFSET $1 ROWS FETCH NEXT $2 ROWS ONLY', [offset, count]);
            break;
        default:
            result = {};
        }
        return pgPool.clearNull(result.rows);
    }
    /**
     * Get banners
     *
     *
     */
    async getBanners() {
        let result;
        log.debug('getBanners');
        result = await pgPool.query('SELECT b.id, score, lang, s.id as "refId", target_url as "targetUrl", s.mimetype as "mimeType", tooltip FROM banner b, storage_lob s WHERE b.id_asset = s.id');
        return result.rows.map(b => {
            let r = {id:b.id, score: b.score, ref:{refId: b.refId, targetUrl: b.targetUrl, mimeType: b.mimeType, tooltip: b.tooltip}};
            if(b.lang) {
                r.lang = b.lang;
            }
            return r;
        });
    }
    /**
     * add banner
     * banner
     * {"id":"foo","score":0,"lang":"uk","ref":{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"}}
     */
    async addBanner(banner) {
        log.debug('addBanner %o', banner);
        banner.id = await pgPool.genSequence();
        await pgPool.query('INSERT INTO banner(id, id_asset, target_url, tooltip, score, lang) VALUES($1, $2, $3, $4, $5, $6);', [banner.id, banner.ref.refId, banner.ref.targetUrl, banner.ref.tooltip, banner.score, banner.lang]);
        return banner.id;
    }
    /**
     * update banner
     * banner
     * {"id":"foo","score":0,"lang":"uk","ref":{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"}}
     */
    async updateBanner(banner) {
        let result;
        log.debug('updateBanner %o', banner);
        result = await pgPool.query(`UPDATE banner SET
                id_asset = $1,
                target_url = $2,
                tooltip= $3,
                score = $4,
                lang = $5
            WHERE id = $6`, [banner.ref.refId, banner.ref.targetUrl, banner.ref.tooltip, banner.score, banner.lang, banner.id]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `Banner [${banner.id}] not found`);
        }
        return banner.id;
    }
    /**
     * delete banner
     * id
     * "foobar"
     */
    async deleteBanner(id) {
        let result;
        log.debug('deleteBanner', id);
        result = await pgPool.query('DELETE FROM banner WHERE id = $1', [id]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `Banner [${id}] not found`);
        }
        return id;
    }

}

const bannerDb = new BannerDb();
module.exports = bannerDb;
