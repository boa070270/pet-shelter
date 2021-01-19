const Code = require('@hapi/code');
const expect = Code.expect;
const dao = require('../../src/services/lang-db');

describe('Test lang-db', ()=>{
    it('getLangs', async ()=>{
        let result = await dao.getLangs();
        expect(result).to.array();
        expect(result.length).to.equal(3);
    });
    it('upsetLang', async ()=>{
        let result = await dao.upsetLang({'lang':'fr','displayName':'French','rate':1});
        expect(result).to.equal('fr');
        result = await dao.getLangs();
        expect(result).to.array();
        expect(result.length).to.equal(4);
    });
    it('deleteLang', async ()=>{
        let result = await dao.deleteLang('fr');
        expect(result).to.equal('fr');
        result = await dao.getLangs();
        expect(result).to.array();
        expect(result.length).to.equal(3);
    });
});
