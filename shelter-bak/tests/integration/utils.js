const lObj = require('../../src/services/large-objects-db');

/**
 * functions that is used other tests
 * @type {{}}
 */
module.exports = {
    /**
     * save text as large object and return id
     * @param text
     * @returns {Promise<*>}
     */
    saveLargeObject: async (text) => {
        let {id, stream, result} = await lObj.upload({originalname:'originalname', encoding:'7bit', mimetype:'text/text', size:100});
        const buffer = Buffer.from(text);
        stream.write(buffer);
        stream.end();
        await result;
        return id;
    },
    deleteLargeObjects: async (ids) => {
        for(const id of ids) {
            await lObj.deleteFile(id);
        }
    }
};
