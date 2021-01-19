const pgPool = require('../db/pg-pool');
const log = require('../log').getLogger('SERVICE.USERS');
const crypto = require('crypto');
const {HttpCodeError} = require('../rest-utils');
const SALT = process.env.PET_SHELTER_SALT || '@pet-shelter.org';
class UsersDb {
    hashPassword(login, password) {
        function makeHash(val) {
            return crypto.createHash('sha256').update(val, 'utf8').digest();
        }
        return crypto.createHash('sha256')
            .update(password, 'utf8')
            .update(makeHash(login+SALT))
            .digest('base64');
    }
    /**
     * Get users
     *
     *
     */
    async getUsers() {
        let result;
        log.debug('getUsers with query "select login,authType as "authType",\'******\' as password,enabled,role from users');
        result = await pgPool.query('select login,authType as "authType",\'******\' as password,created,enabled,role from users', []);
        return pgPool.clearNull(result.rows.map(u => {
            if (u.role) {
                u.role = u.role.split(',');
            }
            return u;
        }));
    }
    /**
     * add user
     * user
     * {"login":"foo","authType":"basic","password":"foo","role":"admin","created":"foo","enabled":false}
     */
    async addUser(user) {
        let result;
        let role = '';
        if (user.role instanceof Array) {
            role = user.role.join(',');
        }
        log.debug('addUser', user);
        result = await pgPool.query('insert into users(login,authType,password_hash,enabled,role) values($1,$2,$3,$4,$5)',
            [user.login, user.authType, this.hashPassword(user.login, user.password), user.enabled, role]);
        if(result.rowCount === 1) {
            return user.login;
        }
    }
    /**
     * update user
     * user
     * {"login":"foo","authType":"basic","password":"foo","role":"admin","created":"foo","enabled":false}
     */
    async updateUser(user) {
        let result;
        log.debug('update users', user);
        let role = '';
        if (user.role instanceof Array) {
            role = user.role.join(',');
        }
        result = await pgPool.query('update users set authType = $1, role = $2, enabled = $3 where login = $4', [user.authType, role, user.enabled, user.login]);
        if(result.rowCount === 1) {
            return user.login;
        }
        throw new HttpCodeError(404, `User [${user.login}] not found`);
    }
    /**
     * delete user
     * login
     * "foobar"
     */
    async deleteUser(login) {
        let result;
        log.debug('deleteUser with query "delete from users where login = :login"');
        result = await pgPool.query('delete from users where login = $1', [login]);
        if(result.rowCount === 1) {
            return login;
        }
        throw new HttpCodeError(404, `User [${login}] not found`);
    }

    async getUser(login, password) {
        log.debug('getUser: %s', login);
        const res = await pgPool.query('select login,authType as "authType",\'******\' as password,created,enabled,role from users where login = $1 and password_hash = $2', [login, this.hashPassword(login, password)]);
        const user = res.rows[0];
        if(user) {
            const roles = user.role || '';
            user.role = roles.split(',').map(s => s.trim());
        }
        return user;
    }
    async changePassword(login, password, newPassword) {
        log.debug('getUser: %s', login);
        const res = await pgPool.query(
            `update users set password_hash = $3 where login = $1 and password_hash = $2 
                    returning login,authType as "authType", '******' as password,created,enabled,role`,
            [login, this.hashPassword(login, password), this.hashPassword(login, newPassword)]);
        const user = res.rows[0];
        if(user) {
            const roles = user.role || '';
            user.role = roles.split(',').map(s => s.trim());
        }
        return user;
    }
}

const usersDb = new UsersDb();
module.exports = usersDb;
