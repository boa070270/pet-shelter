const Code = require('@hapi/code');
const expect = Code.expect;
const dao = require('../../src/services/users-db');

describe('Test users-db', ()=>{
    it('addUser', async ()=>{
        let result = await dao.addUser({login:'foo',authType:'basic',password:'foo',role:'admin',enabled:false});
        expect(result).to.equals('foo');
    });
    it('addUser negative', async ()=>{
        try {
            await dao.addUser({login: 'foo', authType: 'basic', password: 'foo', role: 'admin', enabled: false});
            throw new Error();
        } catch (e) {
            expect(e.message).to.equals('duplicate key value violates unique constraint "users_pkey"');// TODO
        }
    });
    it('getUsers', async ()=>{
        let result = await dao.getUsers();
        expect(result).to.equals([{login:'foo',authType:'basic',password:'******',role:'admin',enabled:false}]);
    });
    it('updateUser', async ()=>{
        let result = await dao.updateUser({login:'foo',authType:'basic',password:'foo',role:'admin',enabled:false});
        expect(result).to.equals('foo');
    });
    it('deleteUser', async ()=>{
        let result = await dao.deleteUser('foo');
        expect(result).to.equals('foo');
    });
    it('deleteUser negative', async ()=>{
        try {
            await dao.deleteUser('foo');
            throw new Error();
        } catch (e) {
            expect(e.code).to.equals(404);
        }
    });

});
