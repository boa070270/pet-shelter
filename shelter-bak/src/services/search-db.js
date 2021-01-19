const esPool = require('../db/es-pool');
const pgPool = require('../db/pg-pool');
const log = require('../log').getLogger('SERVICE.SEARCH');

class SearchDb {
    /**
     * Search by all site
     * index
     * lang
     * query
     * count
     * from
     * "foobar"
     * "foobar"
     * "foobar"
     * 0
     * "foobar"
     */
    async search(index, lang, query, size, from = 0) {
        log.debug('search index: %s, lang: %s, query: %s, size: %s, from: %s',
            index, lang, query, size, from);
        let q = query;
        if (lang && index === 'page') {
            q = 'lang:'+lang + ' AND ( '+ q + ')';
        }
        let result;
        if (index === 'page') {
            result = await esPool.searchPage(q, size, from);
        } else if (index === 'pet') {
            result = await esPool.searchPets(q, size, from);
        } else if (index === 'asset') {
            result = await esPool.searchAssets(q, size, from);
        } else {
            result = await esPool.search(q, size, from);
        }
        const total = result.hits.total.value;
        if (result.hits.hits.length > 0) {
            const scrollId = result._scroll_id;
            const hits = result.hits.hits;
            const data = {scrollId, data: [], total};
            for (const hit of hits) {
                const item = hit._source;
                item.id = hit._id;
                item.resource = hit._type;
                data.data.push(item);
            }
            return data;
        }
        return {data:[], total};
    }
    /**
     * Search by all site
     * operator
     *fields
     *example
     * {"operator":"and","fields":[{"name":"foo","value":"foo"},{"name":"foo","value":"foo"}]}
     */
    async searchPet(operator, fields, size, from = 0) {
        let result;
        log.debug('search-pet with query "SELECT NOW()" YOU SHOULD REPLACE THIS');
        result = await pgPool.query('SELECT NOW()', [operator, fields, size, from]);
        return result.rows;
    }

}

const searchDb = new SearchDb();
module.exports = searchDb;
