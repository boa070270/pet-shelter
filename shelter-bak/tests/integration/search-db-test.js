const Code = require('@hapi/code');
const expect = Code.expect;
const dao = require('../../src/services/search-db');

describe('Test search-db', ()=>{
    xit('search', async ()=>{
        let result = await dao.search('foobar', 'foobar', 'foobar', 0, 'foobar');
        expect(result).to.exist();
    });
    xit('search-pet', async ()=>{
        let result = await dao.searchPet({'operator':'and','fields':[{'name':'foo','value':'foo'},{'name':'foo','value':'foo'}]});
        expect(result).to.exist();
    });

});
