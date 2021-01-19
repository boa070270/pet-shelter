const user = require('../src/services/users-db');

(async ()=>{
    await user.addUser({
        login: 'admin',
        authType:'basic',
        password: '******',
        role: 'admin',
        enabled: true
    });
})();
