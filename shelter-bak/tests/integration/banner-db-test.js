const _ = require('lodash');
const Code = require('@hapi/code');
const expect = Code.expect;
const dao = require('../../src/services/banner-db');
const utils = require('./utils');

describe('Test banner-db', ()=>{
    const banner = {id:'',score:0,lang:'uk',ref:{refId:'',targetUrl:'foo',mimeType:'text/text',tooltip:'foo'}};
    const lObjIds = [];
    after(async ()=>{
        await utils.deleteLargeObjects(lObjIds);
    });
    it('getCarousel', async ()=>{
        let result = await dao.getCarousel('page', 'foobar', 0, 0);
        expect(result).to.exist();
        result = await dao.getCarousel('pet', 'foobar', 0, 0);
        expect(result).to.exist();
        result = await dao.getCarousel('banner', 'foobar', 0, 0);
        expect(result).to.exist();
    });
    it('addBanner', async ()=>{
        const refId = await utils.saveLargeObject('Hello worlds!');
        lObjIds.push(refId);
        banner.ref.refId = refId;
        const result = await dao.addBanner(banner);
        banner.id = result;
        expect(result).to.exist();
    });
    it('getBanners', async ()=>{
        let result = await dao.getBanners();
        expect(result).to.equals([banner]);
    });
    it('updateBanner', async ()=>{
        const refId = await utils.saveLargeObject('Hello worlds!');
        lObjIds.push(refId);
        banner.ref.refId = refId;
        const result = await dao.updateBanner(banner);
        expect(result).to.equals(banner.id);
    });
    it('updateBanner negative', async ()=>{
        try {
            const b = _.cloneDeep(banner);
            b.id = 'absent';
            await dao.updateBanner(b);
            throw new Error();
        } catch (e) {
            expect(e.code).to.equal(404);
        }
    });
    it('deleteBanner', async ()=>{
        let result = await dao.deleteBanner(banner.id);
        expect(result).to.equal(banner.id);
    });
    it('deleteBanner negative', async ()=>{
        try {
            await dao.deleteBanner('absent');
            throw new Error();
        } catch (e) {
            expect(e.code).to.equal(404);
        }
    });

});
