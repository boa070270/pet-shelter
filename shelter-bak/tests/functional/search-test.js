const Code = require('@hapi/code');
const expect = Code.expect;
const api = require('axios').create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer cdcba59b-7701-4322-ad57-bf86b927f218'
    }
});
describe('Test search controller',()=>{
    it('search', async ()=>{
        let result = await api.get('/search?lang=foobar?query=foobar?tag=foobar?count=0?scrollId=foobar',);
        result = result.data;
        expect(result).to.exist();
    });
    it('search-pet', async ()=>{
        let result = await api.post('/search-pet',{"operator":"and","fields":[{"name":"foo","value":"foo"},{"name":"foo","value":"foo"}]});
        result = result.data;
        expect(result).to.exist();
    });

});