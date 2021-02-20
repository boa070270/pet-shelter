const fs = require('fs');
const http = require('http');
const app = require('connect')();
const swaggerTools = require('swagger-tools');
const YAML = require('yaml');
const { resolve } = require('path');
const parsedSwagger = YAML.parse(fs.readFileSync(resolve(__dirname,'./swagger.yaml')).toString());
const log = require('./log').getLogger('APP.MAIN');
const pgPool = require('./db/pg-pool');
const esPool = require('./db/es-pool');
const browser = require('./services/brousers');
const security = require('./security');
const {writeResponseError} = require('./rest-utils');


const serverPort = 8080;

// swaggerRouter configuration
const options = {
    controllers: './src/controllers',
    useStubs: process.env.NODE_ENV === !!'development' // Conditionally turn on stubs (mock mode)
};


function initSwagger(parsedSwagger) {
    return new Promise((resolve)=>{
        swaggerTools.initializeMiddleware(parsedSwagger, function (middleware) {
            resolve(middleware);
        });
    });
}
function validationError(err, req, res, next) {
    if(!err) {
        next();
    } else {
        log.error('Validation error: %o, body: %o', err, req.body);
        writeResponseError(res, err, req);
    }
}
async function main() {
    // Start DB
    await pgPool.init();
    const middleware = await initSwagger(parsedSwagger);
    // Initialize the Swagger middleware
    log.debug('initializing swagger middleware');
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    app.use(middleware.swaggerSecurity(security));
    // Validate Swagger requests
    // UNCOMMENT FOR SWAGGER VALIDATIONS
    app.use(middleware.swaggerValidator());
    app.use(validationError);
    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());
    log.info('Web application collected');
    // Start the server
    http.createServer(app).listen(serverPort, function () {
        log.info('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    });
}
process.on('exit', async () => {
    log.debug('Shutdown app');
    try {
        await browser.stop();
    } catch (e) {
        log.error('Error shutdown browser: %s', e);
    }
    try {
        await pgPool.stop();
    } catch (e) {
        log.error('Error shutdown DB: %s', e);
    }
    try {
        await esPool.stop();
    } catch (e) {
        log.error('Error shutdown ES: %s', e);
    }
});

main().then(() => {});
