const Code = require('@hapi/code');
const expect = Code.expect;
const api = require('axios').create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer cdcba59b-7701-4322-ad57-bf86b927f218'
    }
});
describe('Test menu controller',()=>{
    const menu = {
        menu:{path: 'about', position: 0, parentId: null, component: 'componentA', role: 'roleA'},
        titles:[{id:'about',lang:'uk',title:'Про нас'},{id:'about',lang:'en',title:'About us'}]};
    it('upsetMenu', async ()=>{
        let result = await api.post('/menu',menu);
        result = result.data.data;
        expect(result).to.equals({id:'about'});
    });
    it('getMenus', async ()=>{
        let result = await api.get('/menu',);
        result = result.data.data;
        expect(result).to.equals({menus:[menu.menu], titles:menu.titles});
    });
    it('getMenu', async ()=>{
        let result = await api.get('/menu/about',);
        result = result.data.data;
        expect(result).to.equals(menu);
    });
    it('getMenu negative', async ()=>{
        try {
            await api.get('/menu/absent');
            throw new Error();
        } catch(e) {
            let response = e.response;
            expect(response.status).to.equal(404);
            expect(response.data).to.equal({status:404, details:{}, message: 'Menu [absent] not found'});
        }
    });
    it('upsetMenu add child', async ()=>{
        let result = await api.post('/menu',{
            menu:{path: 'about2', position: 0, parentId: 'about', component: 'componentA', role: 'roleA'},
            titles:[{id:'about2',lang:'uk',title:'Про нас2'},{id:'about2',lang:'en',title:'About us2'}]});
        result = result.data.data;
        expect(result).to.equals({id:'about2'});
        result = await api.post('/menu',{
            menu:{path: 'about3', position: 0, parentId: 'about2', component: 'componentA', role: 'roleA'},
            titles:[{id:'about3',lang:'uk',title:'Про нас3'},{id:'about3',lang:'en',title:'About us3'}]});
        result = result.data.data;
        expect(result).to.equals({id:'about3'});
    });
    it('deleteMenu', async ()=>{
        let result = await api.delete('/menu/about3',);
        result = result.data.data;
        expect(result).to.equals({id:'about3'});
    });
    it('deleteMenu negative', async ()=>{
        try {
            await api.delete('/menu/absent',);
            throw new Error();
        } catch(e) {
            let response = e.response;
            expect(response.status).to.equal(404);
            expect(response.data).to.equal({status:404, details:{}, message: 'Menu [absent] not found'});
        }
    });
    it('deleteMenu with children negative', async ()=>{
        try {
            await api.delete('/menu/about',);
            throw new Error();
        } catch(e) {
            let response = e.response;
            expect(response.status).to.equal(409);
            expect(response.data).to.equal({status:409, details:{}, message: 'There are children menu for this path: about'});
        }
    });
    it('deleteMenu with children', async ()=>{
        let result = await api.delete('/menu/about?force=true',);
        result = result.data.data;
        expect(result).to.equals({id:'about'});
    });

});
