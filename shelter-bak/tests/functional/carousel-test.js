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

describe('Test carousel',()=>{
    const lObj = [];
    const banners = [];
    const pages = [];
    const pets = [];
    before(async ()=>{
        const field1 = {name:'f1',type:'string',subtype:'textarea'};
        const titles1 = [{id:'f1',lang:'uk',title:'F1'},{id:'f1',lang:'en',title:'F1'}];
        await api.post('/fields',{field: field1, titles: titles1});
        for(let i = 0; i < 10; i++) {
            const refId = await utils.saveLargeObject('Hello World!');
            lObj.push(refId);
        }
    });
    after(async()=>{
        for(const id of banners) {
            await api.delete(`/banners/${id}`,);
        }
        for(const id of pages) {
            await api.delete(`/page/${id}`,);
        }
        for(const id of pets) {
            await api.delete(`/pets/${id}`,);
        }
        for(const id of lObj) {
            await api.delete(`/files/${id}`);
        }
        await api.delete('/fields/f1');
    });
    function checkResult(data, size, resource) {
        expect(data).be.array();
        expect(data.length).to.equal(size);
        for(const r of data) {
            expect(r.resource).to.equal(resource);
            expect(r.assetId).be.string();
            expect(r.targetUrl).be.string();
            expect(r.mimeType).be.string();
            expect(r.tooltip).be.string();
        }
    }
    it('add banners', async()=>{
        let i = 0;
        for(const refId of lObj) {
            i++;
            const banner = {id:'',score:i,lang:'uk',ref:{refId, mimeType:'text/plain',targetUrl:''+i,tooltip:''+i}};
            let result = await api.post('/banners',banner);
            result = result.data.data;
            banners.push(result.id);
        }
    });
    it('add pages', async()=>{
        let i = 0;
        for(const refId of lObj) {
            i++;
            const page = {id:'',lang:'uk',title:''+i,summary:''+i,body:''+1,score:i,draft:false,tags:'foo',restriction:'admin, writer',
                ref:[ {refId, mimeType:'text/plain', tooltip:'foo'}]};
            let result = await api.post('/page',page);
            result = result.data.data;
            pages.push(result.id);
        }
    });
    it('add pets', async()=>{
        let i = 0;
        for(const refId of lObj) {
            i++;
            const pet = {id:'', fields:[{name:'f1',value:'foo'+i}], ref:[{refId,mimeType:'text/plain',tooltip:'foo'}]};
            let result = await api.post('/pets',pet);
            result = result.data.data;
            pets.push(result.id);
        }
    });
    it('getCarousel banner', async ()=>{
        let result = await api.get('/carousel/banner?lang=uk&count=3&offset=0');
        const first = result.data.data;
        checkResult(first, 3, 'banner');
        result = await api.get('/carousel/banner?lang=uk&count=6&offset=3');
        const second = result.data.data;
        checkResult(second, 6, 'banner');
        result = await api.get('/carousel/banner?lang=uk&count=6&offset=9');
        const third = result.data.data;
        checkResult(third, 1, 'banner');
    });
    it('getCarousel banner lang en', async ()=>{
        let result = await api.get('/carousel/banner?lang=en&count=3&offset=0');
        const first = result.data.data;
        checkResult(first, 0, 'banner');
    });
    it('getCarousel banner lang absent', async ()=>{
        let result = await api.get('/carousel/banner?count=3&offset=0');
        const first = result.data.data;
        checkResult(first, 3, 'banner');
    });
    it('getCarousel count absent (default 3)', async ()=>{
        let result = await api.get('/carousel/banner?lang=uk&offset=0');
        const first = result.data.data;
        checkResult(first, 3, 'banner');
    });
    it('getCarousel offset absent', async ()=>{
        let result = await api.get('/carousel/banner');
        const first = result.data.data;
        checkResult(first, 3, 'banner');
    });
    it('getCarousel page', async ()=>{
        let result = await api.get('/carousel/page?lang=uk&count=3&offset=0');
        const first = result.data.data;
        checkResult(first, 3, 'page');
        result = await api.get('/carousel/page?lang=uk&count=6&offset=3');
        const second = result.data.data;
        checkResult(second, 6, 'page');
        result = await api.get('/carousel/page?lang=uk&count=6&offset=9');
        const third = result.data.data;
        checkResult(third, 1, 'page');
    });
    it('getCarousel page lang en', async ()=>{
        let result = await api.get('/carousel/page?lang=en&count=3&offset=0');
        const first = result.data.data;
        checkResult(first, 0, 'page');
    });
    it('getCarousel page lang absent', async ()=>{
        let result = await api.get('/carousel/page?count=3&offset=0');
        const first = result.data.data;
        checkResult(first, 3, 'page');
    });
    it('getCarousel pet', async ()=>{
        let result = await api.get('/carousel/pet?count=3&offset=0');
        const first = result.data.data;
        checkResult(first, 3, 'pet');
        result = await api.get('/carousel/pet?count=6&offset=3');
        const second = result.data.data;
        checkResult(second, 6, 'pet');
        result = await api.get('/carousel/pet?count=6&offset=9');
        const third = result.data.data;
        checkResult(third, 1, 'pet');
    });

});
