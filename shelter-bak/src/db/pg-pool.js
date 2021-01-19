const BigSequencer = require('../utils/big-sequencer');

const _ = require('lodash');
const { resolve } = require('path');
const { getConfig } = require('../config');
const { Pool } = require('pg');
const { readFileSync } = require('fs');
const log = require('../log').getLogger('PG.POOL');

class PgPool {
    constructor() {
        let config = getConfig();
        if(config.db) {
            this.dbInfo = config.db;
        }
        this.sequencers = {};
    }
    async init() {
        log.info('Init DB (postgres) connection: %o', this.dbInfo);
        let ddl = readFileSync(resolve(__dirname, './db.sql'), 'utf8');
        await this.query(ddl);
    }
    async stop() {
        return this.onExit();
    }
    async onExit() {
        log.trace('onExit');
        if(_.isObject(this.pool)) {
            this.pool.end();
        }
    }
    onPullError(err) {
        log.error(err);
        delete this.pool;
    }
    createPull() {
        log.trace('createPull: %o', this.dbInfo);
        const newPool = new Pool(this.dbInfo);
        newPool.on('error', err => this.onPullError(err));
        return newPool;
    }
    async getPool() {
        log.trace('getPool');
        if (_.isUndefined(this.pool)) {
            this.pool = this.createPull();
        }
        return this.pool;
    }
    async query(sqlString, values) {
        log.debug('query: %s, %o', sqlString, values);
        const pool = await this.getPool();
        log.debug('finished awaiting pool %o', pool.options);
        try {
            let result = await pool.query(sqlString, values);
            log.debug('completed: [command: %s. rowCount: %s]', result.command, result.rowCount);
            return result;
        } catch (e) {
            log.error('onPullError %s', e);
            throw e;
        }
    }
    async getClient() {
        try {
            let pool = await this.getPool();
            let client = await pool.connect();
            return new WrapperClient(client);
        } catch (e) {
            log.error();
            throw e;
        }
    }
    async genSequence(idSequence = 'pet') {
        let seq = this.sequencers[idSequence];
        if(!seq) {
            seq = new Sequencer(idSequence);
            this.sequencers[idSequence] = seq;
        }
        return seq.next();
    }
    clearNull(rows){
        if(rows.length > 0) {
            const pName = Object.getOwnPropertyNames(rows[0]);
            const clearNull = (r)=>{
                for(const p of pName) {
                    if(r[p] === null) {
                        delete r[p];
                    }
                }
                return r;
            };
            return rows.map(r => clearNull(r));
        }
        return rows;
    }
}
class WrapperClient {
    constructor(client) {
        this.closed = false;
        this.client = client;
    }
    async startTransaction(){
        if(!this.closed){
            return this.query('BEGIN');
        }
        throw new Error('You try to start transaction for closed connection');
    }
    async commit() {
        if(!this.closed) {
            this.closed = true;
            try{
                await this.query('COMMIT');
            } finally {
                this.client.release();
            }
        } else {
            console.log('You try to COMMIT already closed connection');
        }
    }
    async rollback() {
        if(!this.closed) {
            this.closed = true;
            try{
                await this.query('ROLLBACK');
            } finally {
                this.client.release();
            }
        } else {
            console.log('You try to ROLLBACK already closed connection');
        }
    }
    async query(sqlString, values) {
        try {
            return await this.client.query(sqlString, values);
        } catch (e) {
            log.error('Exception: ', e); //TODO
            throw e;
        }
    }
}
class Sequencer extends BigSequencer {
    constructor(id) {
        super();
        this.id = id;
    }
    async nextCluster() {
        const result = await pgPool.query(`WITH d AS (SELECT CAST($1 AS VARCHAR) as id),
          upd AS (
              UPDATE pet_sequencer set next = next + 1 WHERE id in (select id from d) returning next
          ), ins AS (
             INSERT INTO pet_sequencer(id, next) SELECT id, 0 as next from d WHERE not exists (select * from upd) returning next
          )
          select sum(next) as next from
             (
                 select next from upd
                 union
                 select next from ins
             ) u`, [this.id]);
        return result.rows[0].next;
    }
}
const pgPool = new PgPool();
module.exports = pgPool;
