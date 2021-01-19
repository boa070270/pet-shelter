const Code = require('@hapi/code');
const expect = Code.expect;
const utils = require('./utils');

const api = require('axios').create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer cdcba59b-7701-4322-ad57-bf86b927f218'
    }
});
describe('Test pages controller',()=>{
    const lObjs = [];
    const page = {
        id:'foo',lang:'en',title:'foo',summary:'foo',body:'foo',score:0,draft:false,tags:'foo',restriction:'admin, writer',
        ref:[ {refId: null, mimeType:'text/plain', tooltip:'foo'}]
    };
    after(async ()=>{
        for(const id of lObjs) {
            await api.delete(`/files/${id}`);
        }
    });
    it('addPage', async ()=>{
        const refId = await utils.saveLargeObject('Hello World!');
        lObjs.push(refId);
        page.ref[0].refId = refId;
        let result = await api.post('/page',page);
        result = result.data.data;
        page.id = result.id;
        expect(page.id).be.string();
    });
    it('getPages', async ()=>{
        let result = await api.get('/page',);
        result = result.data.data;
        expect(result.length).to.equal(1);
        expect(result[0].created).be.string();
        delete result[0].created; //delete the created date we do not know it
        expect(result).to.equals([page]);
    });
    it('updatePage', async ()=>{
        const refId = await utils.saveLargeObject('Hello world!');
        lObjs.push(refId);
        page.ref[0].refId = refId;
        page.body = 'new body';
        let result = await api.put('/page',page);
        result = result.data.data;
        expect(result).to.equals({id:page.id});
    });
    it('deletePage', async ()=>{
        let result = await api.delete(`/page/${page.id}`);
        result = result.data.data;
        expect(result).to.equals({id:page.id});
    });

});
