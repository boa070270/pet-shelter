const Code = require('@hapi/code');
const expect = Code.expect;
const dao = require('../../src/services/pets-db');
const utils = require('./utils');

describe('Test pets-db', ()=>{
    const field1 = {name:'f1',type:'string',subtype:'textarea'};
    const titles1 = [{id:'f1',lang:'uk',title:'F1'},{id:'f1',lang:'en',title:'F1'}];
    const field2 = {name:'f2',type:'string'};
    const titles2 = [{id:'f2',lang:'uk',title:'F2'}];
    const field3 = {name:'f3',type:'number'};
    const titles3 = [{id:'f3',lang:'uk',title:'F3'}];
    const field4 = {name:'f4',type:'enum', enumValues:'enum1,enum2'};
    const titles4 = [{id:'f4',lang:'uk',title:'F3'}];
    const pet = {
        id:'foo',
        fields:[
            {name:'f1',value:'foo'},
            {name:'f2',value:'foo'},
            {name:'f3',value:'100'},
            {name:'f4',value:'enum1'}
        ],
        ref:[{refId:'',targetUrl:'','mimeType':'text/text','tooltip':'foo'}]};
    const lObjIds = [];
    after(async ()=>{
        await utils.deleteLargeObjects(lObjIds);
    });
    it('addField', async ()=>{
        let result = await dao.addField(field1, titles1);
        expect(result).to.equal(field1.name);
        result = await dao.addField(field2, titles2);
        expect(result).to.equal(field2.name);
        result = await dao.addField(field3, titles3);
        expect(result).to.equal(field3.name);
        result = await dao.addField(field4, titles4);
        expect(result).to.equal(field4.name);
    });
    it('getFields', async ()=>{
        let result = await dao.getFields();
        expect(result).to.equals({fields: [field1,field2,field3,field4], titles: [...titles1,...titles2,...titles3,...titles4]});
    });
    it('deleteField negative', async ()=>{
        try {
            await dao.deleteField('absent');
        } catch (e) {
            expect(e.code).to.equal(404);
        }
    });
    it('addPet', async ()=>{
        const refId = await utils.saveLargeObject('Hello world!!!');
        pet.ref[0].refId = refId;
        lObjIds.push(refId);
        let result = await dao.addPet(pet);
        expect(result).to.equal(pet.id);
        pet.ref[0].targetUrl = pet.id;
    });
    it('getPets', async ()=>{
        let result = await dao.getPets();
        expect(result).to.equal([pet]);
    });
    it('updatePet', async ()=>{
        const refId = await utils.saveLargeObject('Hello world!!!');
        pet.ref[0].refId = refId;
        lObjIds.push(refId);
        pet.fields[0].value='field 0';
        let result = await dao.updatePet(pet);
        expect(result).to.equal(pet.id);
        result = await dao.getPets();
        expect(result).to.equal([pet]);
    });
    it('getPet', async ()=>{
        let result = await dao.getPet(pet.id);
        expect(result).to.equal(pet);
    });
    it('getPet negative', async ()=>{
        try {
            await dao.getPet('absent');
            throw new Error();
        } catch (e) {
            expect(e.code).to.equal(404);
        }
    });
    it('deletePet', async ()=>{
        let result = await dao.deletePet(pet.id);
        expect(result).to.equal(pet.id);
    });
    it('deletePet negative', async ()=>{
        try {
            await dao.deletePet('absent');
            throw new Error();
        } catch (e) {
            expect(e.code).to.equal(404);
        }
    });
    it('deleteField', async ()=>{
        let result = await dao.deleteField('f1');
        expect(result).to.equal('f1');
        result = await dao.deleteField('f2');
        expect(result).to.equal('f2');
        result = await dao.deleteField('f3');
        expect(result).to.equal('f3');
        result = await dao.deleteField('f4');
        expect(result).to.equal('f4');
    });

});
