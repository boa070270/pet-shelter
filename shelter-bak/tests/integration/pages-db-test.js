const Code = require('@hapi/code');
const expect = Code.expect;
const dao = require('../../src/services/pages-db');
const utils = require('./utils');

describe('Test pages-db', ()=>{
    const largeObjects = [];
    const page = {
        id:'foo',lang:'en',title:'foo',summary:'foo',body:'foo',score:0,draft:false,tags:'foo',restriction:'admin, writer',
        ref:[ {refId: null, mimeType:'text/text', tooltip:'foo'}]
    };
    after(async ()=>{
        await utils.deleteLargeObjects(largeObjects);
    });
    it('addPage', async ()=>{
        const refId = await utils.saveLargeObject('Hello world!');
        largeObjects.push(refId);
        page.ref[0].refId = refId;
        const result = await dao.addPage(page);
        expect(result).to.equal(page.id);
    });
    it('getPages', async ()=>{
        let result = await dao.getPages();
        expect(result.length).to.equal(1);
        delete result[0].created; //delete a created date
        expect(result).to.equals([page]);
    });
    it('updatePage', async ()=>{
        const refId = await utils.saveLargeObject('Hello world!');
        largeObjects.push(refId);
        page.ref[0].refId = refId;

        let result = await dao.updatePage(page);
        expect(result).to.equal(page.id);
        result = await dao.getPages();
        expect(result.length).to.equal(1);
        delete result[0].created; //delete a created date
        expect(result).to.equals([page]);
    });
    it('deletePage', async ()=>{
        let result = await dao.deletePage(page.id);
        expect(result).to.equal(page.id);
    });
    it('deletePage negative', async ()=>{
        try {
            await dao.deletePage('foo');
            throw new Error('Unreachable code');
        } catch(e) {
            expect(e.code).equal(404);
        }
    });

});
