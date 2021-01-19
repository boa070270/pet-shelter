const pgPool = require('../db/pg-pool');
const {HttpCodeError} = require('../rest-utils');
const log = require('../log').getLogger('SERVICE.LANG');

class LangDb {
    /**
     * Get all available languages
     *
     *
     */
    async getLangs() {
        let result;
        log.debug('getLangs');
        result = await pgPool.query('select lang, display_name as "displayName", rate from shelter_lang', []);
        return pgPool.clearNull(result.rows);
    }
    /**
     * add or update language
     * lang
     * {"lang":"en","displayName":"English","rate":1}
     */
    async upsetLang(lang) {
        log.debug('upsetLang %o', lang);
        await pgPool.query(`with data as (
                select
                cast($1 as varchar) as lang,
                cast($2 as varchar) as display_name,
                cast($3 as integer) as rate
            ), upd as (
                update shelter_lang l
                set display_name = d.display_name,
                    rate = d.rate
                from data d
                where l.lang = d.lang
                returning l.lang
            ) insert into shelter_lang(lang, display_name, rate) select lang, display_name, rate from data d2 where not exists(select from upd)`,
        [lang.lang, lang.displayName, lang.rate]);
        return lang.lang;
    }
    /**
     * delete language
     * lang
     * "foobar"
     */
    async deleteLang(lang) {
        let result;
        log.debug('deleteLang %s', lang);
        result = await pgPool.query('delete from shelter_lang where lang = $1', [lang]);
        if(result.rowCount === 0) {
            throw new HttpCodeError(404, `Language [${lang}] not found`);
        }
        return lang;
    }
}

const langDb = new LangDb();
module.exports = langDb;
