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
describe('Test pets controller',()=>{
    const field1 = {name:'f1',type:'string',subtype:'textarea'};
    const titles1 = [{id:'f1',lang:'uk',title:'F1'},{id:'f1',lang:'en',title:'F1'}];
    const pet = {id:'foo', fields:[{name:'f1',value:'foo'},],
        ref:[{refId:'',targetUrl:'','mimeType':'text/plain','tooltip':'foo'}]};
    const lObj = [];
    after(async()=>{
        for(const id of lObj) {
            await api.delete(`/files/${id}`);
        }
    });

    it('addField', async ()=>{
        let result = await api.post('/fields',{field: field1, titles: titles1});
        result = result.data.data;
        expect(result).to.equals({id:'f1'});
    });
    it('getFields', async ()=>{
        let result = await api.get('/fields',);
        result = result.data.data;
        expect(result).to.equals({fields:[field1], titles: titles1});
    });
    it('addPet', async ()=>{
        const refId = await utils.saveLargeObject('Hello world!!!');
        pet.ref[0].refId = refId;
        lObj.push(refId);
        let result = await api.post('/pets',pet);
        result = result.data.data;
        expect(result.id).be.string();
        pet.id = result.id;
        pet.ref[0].targetUrl = pet.id;
    });
    it('getPets', async ()=>{
        let result = await api.get('/pets',);
        result = result.data.data;
        expect(result).to.equals([pet]);
    });
    it('updatePet', async ()=>{
        let result = await api.put('/pets',pet);
        result = result.data.data;
        expect(result).to.equals({id:pet.id});
    });
    it('getPet', async ()=>{
        let result = await api.get(`/pets/${pet.id}`);
        result = result.data.data;
        expect(result).to.equals(pet);
    });
    it('deletePet', async ()=>{
        let result = await api.delete(`/pets/${pet.id}`);
        result = result.data.data;
        expect(result).to.equals({id:pet.id});
    });
    it('deleteField', async ()=>{
        let result = await api.delete('/fields/f1');
        result = result.data.data;
        expect(result).to.equals({id:'f1'});
    });

});
