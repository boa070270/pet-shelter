const FormData = require('form-data');
const axios = require('axios');
const { Readable } = require('stream');

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
        let form = new FormData();

        form.append('upfile', Readable.from([text]), {
            filename: '111.txt'
        });
        const api = axios.create({
            baseURL: 'http://localhost:3000/api/v1',
            headers: form.getHeaders()
        });
        const res = await api.post('/files', form);
        return res.data.data.id;
    },
    sleep: async (ms) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
};
