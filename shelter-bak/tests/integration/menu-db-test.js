const Code = require('@hapi/code');
const expect = Code.expect;
const dao = require('../../src/services/menu-db');

describe('Test menu-db', ()=>{
    const menu = {
        menu:{path: 'about', position: 0, parentId: null, component: 'componentA', role: 'roleA'},
        titles:[{'id':'about','lang':'uk','title':'Про нас'},{'id':'about','lang':'en','title':'About us'}]};
    it('upsetMenu', async ()=>{
        let result = await dao.upsetMenu(menu.menu, menu.titles);
        expect(result).to.equal(menu.menu.path);
    });
    it('getMenus', async ()=>{
        let result = await dao.getMenus();
        expect(result).to.equals({menus:[menu.menu], titles:menu.titles});
    });
    it('getMenu', async ()=>{
        let result = await dao.getMenu('about');
        expect(result).to.equals(menu);
    });
    it('getMenu negative', async ()=>{
        try {
            await dao.getMenu('absent');
            throw new Error('Unreachable code');
        } catch (e) {
            expect(e.code).to.equal(404);
        }
    });
    it('addSubmenu', async () => {
        let result = await dao.upsetMenu(
            {path: 'sub-menu', position: 0, parentId: 'about', component: 'componentA', role: 'roleA'},
            [{'id':'sub-menu','lang':'uk','title':'Про нас'}]
        );
        expect(result).to.equal('sub-menu');
    });
    it('deleteMenu negative', async ()=>{
        try {
            await dao.deleteMenu('about', false);
            throw new Error('Unreachable code');
        } catch(e) {
            expect(e.code).to.equal(409);
        }
    });
    it('deleteMenu', async ()=>{
        let result = await dao.deleteMenu('about', true);
        expect(result).to.equal('about');
    });

});
