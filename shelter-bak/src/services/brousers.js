const db = require('../db/pg-pool');
const uuid = require('uuid-random');

const MAX_BATCH_SIZE = 100;
const MAX_DURATION = 100;
const Q = `with ids as (select $1::json[] as j),
                nums as (select row_number() over () rownum from information_schema.columns),
                data as (
                    select rownum, ((j[rownum] ->>'id')::varchar)::uuid id, (j[rownum] ->> 'ip')::varchar ip, (j[rownum] ->> 'd')::timestamptz d
                    from ids i,
                         nums r
                    where r.rownum <= array_length(i.j, 1)
                ),
                upd as (
                    update browsers set updated = d
                    from data where browser_id = id and remote_ip = ip
                    returning browser_id, remote_ip
                )
                insert into browsers(browser_id, remote_ip, enabled, created)
                select id, ip, true, d from data where not exists (select id from upd where browser_id = id and remote_ip = ip)`;
class Browsers {
    constructor() {
        this.cache = [];
        this.nextSync = Date.now() + MAX_DURATION;
    }
    batchUpdate() {
        const size = this.cache.length > MAX_BATCH_SIZE ? MAX_BATCH_SIZE : this.cache.length;
        const batch = this.cache.slice(0, size);
        this.cache = this.cache.slice(size);
        this.nextSync = Date.now() + MAX_DURATION;
        db.query(Q, [batch]).then(
            r => console.log(r.rows)
        ).catch(err => console.log(err));
    }
    addId(id,ip) {
        const date = new Date();
        const o = this.cache.find(v => v.id === id && v.ip === ip);
        if (o) {
            o.d = date.toISOString();
        } else {
            this.cache.push({id, ip, d: date.toISOString()});
        }
        if (this.cache.length > MAX_BATCH_SIZE || this.nextSync < Date.now()) {
            this.batchUpdate();
        }
    }
    newId(ip){
        const u = uuid();
        this.addId(u,ip);
        return u;
    }
    updateId(id,ip) {
        if (id) {
            this.addId(id,ip);
        }
    }
    async stop(){
        while (this.cache.length > 0) {
            await this.batchUpdate();
        }
    }
}
const browser = new Browsers();

module.exports = browser;
