const pgPool = require('../db/pg-pool');
const {HttpCodeError} = require('../rest-utils');
const log = require('../log').getLogger('SERVICE.VOTES');

const SET_V = `with data as (select
    cast($1 as varchar) resId,
    cast($2 as uuid) clientId,
    cast($3 as int) voteId,
    cast($4 as varchar) v                 
    )
    insert into votes(res_id, browser_id, vote_id, vote)
    select resId, clientId, voteId, v from data 
    where not exists(select * from votes where res_id = resId and browser_id = clientId and vote_id = voteId)`;

const GET_V = `with data as (select
    cast($1 as varchar) resId,
    cast($2 as uuid) clientId
    ), me as (
         select vote_id, vote from votes, data where res_id = resId and browser_id = clientId
     ), gr as (
         select vote_id, vote, count(*) as cnt from votes, data where res_id = resId
         group by vote_id, vote 
    )
    select 'me' as who, resId as "resId", vote_id as "voteId", vote, 1 as "count" from me, data
    union 
    select 'all' as who, resId as "resId", vote_id as "voteId", vote, cnt as "count"  from gr, data`;
const GET_COM = `
    with recursive rcomments as (
        select
            id, created, res_id as "resId", nick_name as "nickName", comm_id as "commentId", comment, browser_id
        from comments where res_id = $1 and coalesce(comm_id, 'unknown') = coalesce($2, comm_id, 'unknown')
        union
        select
            c.id, c.created, c.res_id as "resId", c.nick_name as "nickName", c.comm_id as "commentId", c.comment, browser_id
        from comments c
                 inner join rcomments r on c.comm_id = r.id
    ), vote_me as (
        select r.id, vote from votes, rcomments r where res_id = r.id and browser_id = $5
    ), vote_gr as (
        select r.id, vote, count(*) as cnt from votes, rcomments r where res_id = r.id
        group by r.id, vote
    ), n as (
        select "commentId", count(*) as "numberOf" from rcomments group by "commentId"
    ), g as (
        select count(*) cnt, max(created) last from rcomments
    )
    select g.*, r.*, n."numberOf", vote_gr.vote "voteGr", vote_gr.cnt "voteGrCount", vote_me.vote "voteMe" from rcomments r
    left join vote_gr on vote_gr.id = r.id
    left join vote_me on vote_me.id = r.id
    left join n on n."commentId" = r.id
    join g on 1 = 1
    order by r."commentId" asc NULLS FIRST, r.created asc
    OFFSET $3 ROWS FETCH NEXT $4 ROWS ONLY`;

const ADD_COMMENT = `with data as (select
    cast($1 as varchar) resId,
    cast($2 as uuid) clientId,
    cast($3 as varchar) txt,
    cast($4 as varchar) nick,
    cast($5 as varchar) commentId,
    cast($6 as varchar) newId                 
    )
    insert into comments(id, res_id, browser_id, comm_id, comment, nick_name)
    select newId, resId, clientId, commentId, txt, nick from data
    returning id`;
class Votes {
    async vote(resId, clientId, value, voteId = 0) {
        log.debug('Vote: resId %s, clientId: %s, voteId: %s, value: %s', resId, clientId, voteId, value);
        await pgPool.query(SET_V, [resId, clientId, voteId, value]);
        return resId;
    }
    async getVotes(resId, clientId) {
        log.debug('getVote: resId %s, clientId: %s', resId, clientId);
        const res = await pgPool.query(GET_V, [resId, clientId]);
        return res.rows;
    }
    /**
     * add / modify comment
     * @param resId - id of resource
     * @param clientId - browserId
     * @param comment - text of comment
     * @param nick - nickName
     * @param commentId - commentId is used when we want add comment to comment
     * @returns {Promise<void>}
     */
    async addComment(resId, clientId, comment, nick = 'Anonymous', commentId = null) {
        const newId = await pgPool.genSequence();
        const res = await pgPool.query(ADD_COMMENT, [resId, clientId, comment, nick, commentId, newId]);
        return res.rows[0].id;
    }
    async updateComment(id, clientId, text) {
        log.debug('updateComment: id %s', id);
        const res = await pgPool.query('update comments set comment = $2 where id = $1 and browser_id = $3', [id, text, clientId]);
        if(res.rowCount === 1) {
            return id;
        }
        throw new HttpCodeError(404, 'Not found');
    }
    async getComments(resId, commentId, from, size, clientId) {
        log.debug('getComments %s', resId);
        const res = pgPool.query(GET_COM, [resId, commentId, from, size, clientId]);
        if(res.rowCount === 0) {
            throw new HttpCodeError(404, 'Not found');
        }
        const rows = pgPool.clearNull(res.rows);
        const result = {numberOf: rows[0].cnt, lastComment: rows[0].last, responses:[]};
        for (const r of rows) {
            const f = result.responses.find(v => v.id === r.id);
            if(!f) {
                r.vote = [];
                r.isMy = (r.browser_id === clientId);
                if (r.voteMe) {
                    r.vote.push({who: 'me', vote: r.voteMe, count: 1});
                    delete r.voteMe;
                }
                if(r.voteGr) {
                    r.vote.push({who: 'all', vote: r.voteGr, count: r.voteGrCount || 0});
                    delete r.voteGr;
                    delete r.voteGrCount;
                }
                result.responses.push(r);
            } else {
                if(r.voteGr) {
                    f.vote.push({who: 'all', vote: r.voteGr, count: r.voteGrCount || 0});
                }
            }
        }
        result.vote = await this.getVotes(resId,clientId);
        return result;
    }
}
const votes = new Votes();
module.exports = votes;
