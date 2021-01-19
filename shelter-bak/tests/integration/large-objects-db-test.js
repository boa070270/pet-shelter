const Code = require('@hapi/code');
const expect = Code.expect;
const dao = require('../../src/services/large-objects-db');

describe('Test large-objects-db', ()=>{
    let idObj;
    it('upload', async ()=>{
        let {id, stream, result} = await dao.upload({originalname:'originalname', encoding:'7bit', mimetype:'text/text', size:100});
        const buffer = Buffer.from('Hello world!');
        stream.write(buffer);
        stream.end();
        await result;
        idObj = id;
    });
    it('read', async ()=>{
        let {stream, result} = await dao.read(idObj);
        const chunks = [];
        let content = undefined;
        stream.on('readable', () => {
            let chunk;
            while (null !== (chunk = stream.read())) {
                chunks.push(chunk);
            }
        });
        stream.on('end', () => {
            content = chunks.join('');
        });
        await result;
        expect(content).to.equal('Hello world!');
    });
    it('getFiles', async ()=>{
        let result = await dao.getFiles();
        expect(result).to.exist();
    });
    it('getFile', async ()=>{
        let result = await dao.getFile(idObj);
        expect(result).to.exist();
    });
    it('deleteFile', async ()=>{
        let result = await dao.deleteFile(idObj);
        expect(result).to.exist();
    });
    it('update comment', async ()=>{
        const files = await dao.getFiles();
        for (const {id, originalName} of files) {
            const result = await dao.update(id, `simple comment to ${originalName}`);
            expect(result).equal(id);
        }
    });
});
