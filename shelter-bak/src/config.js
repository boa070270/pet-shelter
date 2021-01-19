const fs = require('fs');
const { resolve } = require('path');
const CONFIG = {
    logger: {
        default: 'debug'
    },
    http: {
        port: 8080,
        publishSpec: true
    },
    db: {
        host: process.env['DB_HOST'] || 'localhost',
        port: process.env['DB_PORT'] * 1 || 5432,
        user: 'shelter',
        password: 'shelter',
        database: 'shelter',
    },
    elasticsearch: {
        host: process.env['ES_HOST'] || 'localhost:9200',
        log: 'trace',
        apiVersion: '7.2'
    }
};

let getConfig = function (){
    let config = CONFIG;
    try {
        let configPath = resolve(__dirname, '../config.json');
        if(configPath && fs.existsSync(configPath)) {
            let buffer = fs.readFileSync(configPath, 'utf8');
            config = buffer.toJSON();
        }
    } catch(e) {
        console.log('Cannot read ../config.json. Using default configuration');
    }
    getConfig = function(){
        return config;
    };
    return getConfig();
};
module.exports = {getConfig};
