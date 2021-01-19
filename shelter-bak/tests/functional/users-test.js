const Code = require('@hapi/code');
const expect = Code.expect;
const api = require('axios').create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer cdcba59b-7701-4322-ad57-bf86b927f218'
    }
});
describe('Test users controller',()=>{
    it('addUser', async ()=>{
        let result = await api.post('/user',{login:'foo',authType:'basic',password:'foo',role:'admin',enabled:false});
        result = result.data.data;
        expect(result).to.equals({id:'foo'});
    });
    it('addUser negative', async ()=>{
        try {
            await api.post('/user', {
                login: 'foo',
                authType: 'basic',
                password: 'foo',
                role: 'admin',
                enabled: false
            });
        } catch (e) {
            expect(e.response.status).equal(500);
        }
    });
    it('getUsers', async ()=>{
        let result = await api.get('/user',);
        result = result.data.data;
        expect(result).to.equals([{login:'foo',authType:'basic',password:'******',role:'admin',enabled:false}]);
    });
    it('updateUser', async ()=>{
        let result = await api.put('/user',{login:'foo',authType:'basic',password:'foo',role:'admin',enabled:false});
        result = result.data.data;
        expect(result).to.equals({id:'foo'});
    });
    it('deleteUser', async ()=>{
        let result = await api.delete('/user/foo',);
        result = result.data.data;
        expect(result).to.equals({id:'foo'});
    });
    it('deleteUser negative', async ()=>{
        try {
            await api.delete('/user/foo',);
            throw new Error();
        } catch (e) {
            let response = e.response;
            expect(response.status).to.equal(404);
            expect(response.data).to.equal({status:404, details:{}, message: 'User [foo] not found'});
        }
    });

});
