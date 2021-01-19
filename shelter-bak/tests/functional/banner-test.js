const _ = require('lodash');
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
describe('Test banner controller',()=>{
    const banner = {id:'',score:0,lang:'uk',ref:{refId:'',targetUrl:'foo',tooltip:'foo'}};
    const lObj = [];
    after(async()=>{
        for(const id of lObj) {
            await api.delete(`/files/${id}`);
        }
    });
    it('addBanner', async ()=>{
        const refId = await utils.saveLargeObject('Hello World!');
        lObj.push(refId);
        banner.ref.refId = refId;
        banner.ref.mimeType = 'text/plain';
        let result = await api.post('/banners',banner);
        result = result.data;
        banner.id = result.data.id;
        expect(banner.id).be.string();
    });
    it('getBanners', async ()=>{
        let result = await api.get('/banners',);
        result = result.data.data;
        expect(result).to.equals([banner]);
    });
    it('updateBanner', async ()=>{
        banner.score = 1;
        banner.lang = 'en';
        const refId = await utils.saveLargeObject('Hello World 2!!');
        lObj.push(refId);
        banner.ref.refId = refId;
        let result = await api.put('/banners',banner);
        result = result.data.data;
        expect(result).to.equal({id:banner.id});
        result = await api.get('/banners',);
        result = result.data.data;
        expect(result).to.equals([banner]);
    });
    it('updateBanner negative', async ()=>{
        try{
            const b = _.cloneDeep(banner);
            b.id = 'absent';
            await api.put('/banners',b);
            throw new Error();
        } catch (e) {
            let response = e.response;
            expect(response.status).to.equal(404);
            expect(response.data).to.equal({status:404, details:{}, message: 'Banner [absent] not found'});
        }
    });
    it('deleteBanner', async ()=>{
        let result = await api.delete(`/banners/${banner.id}`,);
        result = result.data.data;
        expect(result).to.equal({id:banner.id});
    });
    it('deleteBanner negative', async ()=>{
        try{
            await api.delete('/banners/absent');
            throw new Error();
        } catch (e) {
            let response = e.response;
            expect(response.status).to.equal(404);
            expect(response.data).to.equal({status:404, details:{}, message: 'Banner [absent] not found'});
        }
    });

});
