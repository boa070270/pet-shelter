const pgPool = require('../db/pg-pool');
const esPool = require('../db/es-pool');
const log = require('../log').getLogger('SERVICE.PAGES');
const {HttpCodeError} = require('../rest-utils');

function makePage(row) {
    let page = {
        id: row.id,
        lang: row.lang,
        title: row.title,
        summary: row.summary,
        body: row.body,
        created: row.created,
        score: row.score * 1,
        draft: row.draft,
        tags: row.tags,
        restriction: row.restriction,
        menuId: row.menu_id,
        ref: []
    };
    if (row.refId) {
        page.ref.push({refId: row.refId, tooltip: row.tooltip, mimeType: row.mimeType});
    }
    return page;
}
class PagesDb {
    /**
     * Get pages
     *
     *
     */
    async getPages() {
        let result = [];
        log.debug('getPages');
        let res = await pgPool.query(`select p.id, lang, title, summary, body, p.created, score, draft, tags, restriction, menu_id,
                                             a.id_asset as "refId", a.tooltip, s.mimetype as "mimeType"
                                      from pages p
                                               LEFT JOIN page_attachment a on p.id = a.id_page
                                               LEFT JOIN storage_lob s on s.id = a.id_asset
                                      ORDER BY p.id`, []);
        let last = {};
        for(const p of res.rows) {
            if(p.id !== last.id) {
                last = makePage(p);
                result.push(last);
            } else {
                if (p.refId) {
                    last.ref.push({refId: p.refId, tooltip: p.tooltip, mimeType: p.mimeType});
                }
            }
        }
        return result;
    }
    async getPage(id) {
        log.debug(`getPages with query "select id, lang, title, summary, body, created, score, draft, tags, restriction,
             a.id_asset as "refId", a.tooltip, s.mimetype as "mimeType"
             from pages p, page_attachment a, storage_lob s WHERE p.id = a.id_page and a.id_asset = s.id WHERE p.id = {id}`);
        let res = await pgPool.query(`select p.id, lang, title, summary, body, p.created, score, draft, tags, restriction, menu_id,
                                             a.id_asset as "refId", a.tooltip, s.mimetype as "mimeType"
                                      from pages p
                                               LEFT JOIN page_attachment a on p.id = a.id_page
                                               LEFT JOIN storage_lob s on s.id = a.id_asset
                                      WHERE p.id = $1`, [id]);
        if(res.rowCount === 0) {
            throw new HttpCodeError(404, `Page: ${id} not found`);
        }

        let last = {};
        for(const p of res.rows) {
            if (!last.id) {
                last = makePage(p);
            } else {
                if (p.refId) {
                    last.ref.push({refId: p.refId, tooltip: p.tooltip, mimeType: p.mimeType});
                }
            }
        }
        return last;
    }
    async getPageMenu(id) {
        log.debug('getPagesMenu');
        let res = await pgPool.query(`select p.id, lang, title, summary, body, p.created, score, draft, tags, restriction, menu_id,
                                             a.id_asset as "refId", a.tooltip, s.mimetype as "mimeType"
                                      from pages p
                                               LEFT JOIN page_attachment a on p.id = a.id_page
                                               LEFT JOIN storage_lob s on s.id = a.id_asset
                                      WHERE p.menu_id = $1`, [id]);
        if(res.rowCount === 0) {
            throw new HttpCodeError(404, `Page: ${id} not found`);
        }

        let last = {};
        for(const p of res.rows) {
            if (!last.id) {
                last = makePage(p);
            } else {
                if (p.refId) {
                    last.ref.push({refId: p.refId, tooltip: p.tooltip, mimeType: p.mimeType});
                }
            }
        }
        return last;
    }

    /**
     * add page
     * page
     * {"id":"foo","lang":"foo","title":"foo","summary":"foo","body":"foo","score":0,"draft":false,"tags":"foo","restriction":"admin, writer","ref":[{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"},{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"}]}
     */
    async addPage(page) {
        page.id = await pgPool.genSequence();
        log.debug('1. insert into pages(id, lang, title, summary, body, score, draft, tags, restriction) values(:page.id, :page.lang,:page.title, :page.summary, :page.body, :page.score, :page.draft, :page.tags, :page.restriction)');
        const res = await pgPool.query('insert into pages(id, lang, title, summary, body, score, draft, tags, restriction, menu_id) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning created',
            [page.id, page.lang, page.title, page.summary, page.body, page.score, page.draft, page.tags, page.restriction, page.menuId]);
        page.created = res.rows[0].created.toISOString();
        log.debug('2. insert into page_attachment(id_page, id_asset, tooltip) values(:page.id, :page.ref.refId, :page.ref.tooltip)');
        if(page.ref) {
            for(const {refId, tooltip} of page.ref) {
                await pgPool.query(`insert into page_attachment(id_page, id_asset, tooltip)
                                    values ($1, $2, $3)`, [page.id, refId, tooltip]);
            }
        }
        await esPool.putPage(page);
        return page.id;
    }
    /**
     * update page
     * page
     * {"id":"foo","lang":"foo","title":"foo","summary":"foo","body":"foo","score":0,"draft":false,"tags":"foo","restriction":"admin, writer","ref":[{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"},{"refId":"foo","targetUrl":"foo","mimeType":"foo","tooltip":"foo"}]}
     */
    async updatePage(page) {
        let result;
        log.debug('1. UPDATE pages SET title = :page.title, summary = :page.summary, body = :page.body, score = :page.score, draft = :page.draft, tags := :page.tags, restriction = :page.restriction, lang = :page.lang WHERE id = :page.id');
        result = await pgPool.query('UPDATE pages SET modified = now(), title = $1, summary = $2, body = $3, score = $4, draft = $5, tags = $6, restriction = $7, lang = $8, menu_id = $9 WHERE id = $10', [page.title, page.summary, page.body, page.score, page.draft, page.tags, page.restriction, page.lang, page.menuId, page.id]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `The page: ${page.id} not found`);
        }
        log.debug('2. DELETE from page_attachment WHERE id_page = :page.id');
        await pgPool.query('DELETE from page_attachment WHERE id_page = $1', [page.id]);
        log.debug('3.insert into page_attachment(id_page, id_asset, tooltip) values(:page.id, :page.ref.refId, :page.ref.tooltip)');
        if(page.ref) {
            for(const {refId, tooltip} of page.ref) {
                await pgPool.query(`insert into page_attachment(id_page, id_asset, tooltip)
                                    values ($1, $2, $3)`, [page.id, refId, tooltip]);
            }
        }
        await esPool.putPage(page);
        return page.id;
    }
    /**
     * delete page
     * id
     * "foobar"
     */
    async deletePage(id) {
        let result;
        log.debug('deletePage with query "delete from pages where id = :id"');
        result = await pgPool.query('delete from pages where id = $1', [id]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `Page: ${id} not found`);
        }
        await esPool.delPage(id);
        return id;
    }
}

const pagesDb = new PagesDb();
module.exports = pagesDb;
