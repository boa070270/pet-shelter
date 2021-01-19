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

describe('Test large-objects controller',()=>{
    let ASSET_ID;
    it('upload', async ()=>{
        ASSET_ID = await utils.saveLargeObject('Hello World!');
        expect(ASSET_ID*1).be.above(0);
    });
    it('read', async ()=>{
        let result = await api.get(`/assets/${ASSET_ID}`);
        expect(result.headers['content-type']).to.equal('text/plain');
        result = result.data;
        expect(result).to.equal('Hello World!');
    });
    it('getFiles', async ()=>{
        let result = await api.get('/files',);
        result = result.data;
        expect(result.data).be.array();
        expect(result.data.length).be.above(0);
    });
    it('getFile', async ()=>{
        let result = await api.get(`/files/${ASSET_ID}`);
        result = result.data.data;
        expect(result.file.originalName).to.equal('111.txt');
        expect(result.file.numberOfReferences).to.equal(0);
        expect(result.file.size).to.equal(12);
    });
    it('getFile negative', async ()=>{
        try {
            await api.get('/files/absent');
            throw new Error();
        } catch (e) {
            let response = e.response;
            expect(response.status).to.equal(404);
            expect(response.data).to.equal({status:404, details:{}, message: 'LargeObject [absent] not found'});
        }
    });
    it('deleteFile', async ()=>{
        let result = await api.delete(`/files/${ASSET_ID}`);
        result = result.data;
        expect(result.data.id).to.equal(ASSET_ID);
    });
    it('deleteFile negative', async ()=>{
        try {
            api.delete('/files/absent');
            throw new Error();
        } catch (e) {
            let response = e.response;
            expect(response.status).to.equal(404);
            expect(response.data).to.equal({status:404, details:{}, message: 'LargeObject [absent] not found'});
        }
    });

});
