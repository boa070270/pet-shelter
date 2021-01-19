const elasticsearch = require('elasticsearch');
const config = require('../config').getConfig();
const client = new elasticsearch.Client(
    config.elasticsearch
);

class EsPool {
    async putAsset(asset){
        return client.index({
            index: 'assets',
            type: 'asset',
            id: asset.id,
            body: asset
        });
    }
    async putPet(pet){
        return client.index({
            index: 'pets',
            type: 'pet',
            id: pet.id,
            body: pet
        });
    }
    async putPage(page){
        return client.index({
            index: 'pages',
            type: 'page',
            id: page.id,
            body: page
        });
    }
    async delAsset(id){
        return client.delete({
            index: 'assets',
            type: 'asset',
            id
        });
    }
    async delPet(id){
        return client.delete({
            index: 'pets',
            type: 'pet',
            id
        });
    }
    async delPage(id){
        return client.delete({
            index: 'pages',
            type: 'page',
            id
        });
    }
    async search(q = '*', size = 10, from = 0, index = ''){
        const req = {
            index,
            q,
            size,
            from,
            sort: ['created:desc']
        };
        if (q.includes('*')) {
            req.expand_wildcards = 'all';
        }
        return client.search(req);
    }
    async searchAssets(q, size = 10, from = 0){
        return this.search(q, size, from, 'assets');
    }
    async searchPets(q, size = 10, from = 0){
        return this.search(q, size, from, 'pets');
    }
    async searchPage(q, size = 10, from = 0){
        return this.search(q, size, from, 'pages');
    }
    async stop() {
        client.close();
    }
}
const esPool = new EsPool();
module.exports = esPool;
