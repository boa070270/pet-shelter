const Code = require('@hapi/code');
const expect = Code.expect;
const api = require('axios').create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer cdcba59b-7701-4322-ad57-bf86b927f218'
    }
});
describe('Test lang controller',()=>{
    it('getLangs', async ()=>{
        let result = await api.get('/lang',);
        result = result.data.data;
        expect(result).be.array();
        expect(result.length).to.equal(3); //this is default languages 'uk', 'en', 'ru'
        for(const lang of result) {
            expect(lang.lang).be.string();
            expect(lang.displayName).be.string();
            expect(lang.rate).be.number();
        }
    });
    it('upsetLang', async ()=>{
        let result = await api.post('/lang',{'lang':'en','displayName':'English','rate':1});
        result = result.data.data;
        expect(result).be.equals({id:'en'});
    });
    it('upsetLang new lang', async ()=>{
        let result = await api.post('/lang',{'lang':'fr','displayName':'Franche','rate':1});
        result = result.data.data;
        expect(result.id).be.equal('fr');
        result = await api.get('/lang',);
        result = result.data.data;
        expect(result).be.array();
        expect(result.length).to.equal(4); //this is default languages 'uk', 'en', 'ru'
    });
    it('deleteLang', async ()=>{
        let result = await api.delete('/lang/fr',);
        result = result.data.data;
        expect(result.id).to.equal('fr');
    });
    it('deleteLang negative', async ()=>{
        try {
            await api.delete('/lang/absent',);
            throw new Error();
        } catch (e) {
            let response = e.response;
            expect(response.status).to.equal(404);
            expect(response.data).to.equal({status:404, details:{}, message: 'Language [absent] not found'});
        }
    });

});
