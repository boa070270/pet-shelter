const log = require('./log').getLogger('security');
const users = require('./services/users-db');

function print(authHandler, req, def, scopes) {
    log.debug('%s url:%s, def:%o, scopes:%o',
        authHandler,
        req.url,
        def,
        scopes||[]);
}
function scope(req) {
    const security = ((req.swagger || {}).operation || {}).security;
    if(security instanceof Array) {
        const OAuth2 = security.find(o => 'OAuth2' in o);
        return (OAuth2 || {}).OAuth2;
    }
}
function isRolePresent(user, scope) {
    if(scope instanceof Array && scope.length > 0) {
        if (user.role) {
            for(const s of scope) {
                if (user.role.includes(s)) {
                    return true;
                }
            }
        }
    } else {
        return true;
    }
}
const security = {
    OAuth2: function (req, def, scopes, callback) {
        // Do real stuff here
        print('OAuth2', req, def, scopes);
        const err = {code: 'Unauthorized', statusCode: 401, headers: undefined/*{name:header}*/};
        callback(err); //enable
    },
    ApiKeyAuth: function (req, def, scopes, callback) {
        // Do real stuff here
        print('ApiKeyAuth', req, def, scopes);
        const err = {code: 'Unauthorized', statusCode: 401, headers: undefined/*{name:header}*/};
        callback(err); //disable
    },
    BasicAuth: function (req, def, scopes, callback) {
        // Do real stuff here
        print('BasicAuth', req, def, scopes);
        const err = {code: 'Unauthorized', statusCode: 401, headers: undefined/*{name:header}*/};
        const b64auth = req.headers.authorization || '';
        if (b64auth.startsWith('Basic ')) {
            const [login, password] = Buffer.from(b64auth.substring(6), 'base64').toString().split(':');
            console.log('remoteAddress:', req.connection.remoteAddress);
            if (login && password) {
                users.getUser(login, password).then(user => {
                    console.log(user);
                    if (user && user.enabled && isRolePresent(user, scope(req))) {
                        req.authorized = user;
                        callback();
                    } else {
                        callback(err);
                    }
                });
            } else {
                callback(err);
            }
        } else {
            callback(err);
        }
    },
};

module.exports = security;
