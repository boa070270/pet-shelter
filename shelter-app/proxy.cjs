const HttpsProxyAgent = require('https-proxy-agent');
const proxyConfig = [{
    context: '/api',
    target: 'http://localhost:8080',
    secure: false
}];

function setupForCorporateProxy(proxyConfig) {
    const proxyServer = process.env.http_proxy || process.env.HTTP_PROXY;
    if (proxyServer) {
        const agent = new HttpsProxyAgent(proxyServer);
        console.log('Using corporate proxy server: ' + proxyServer);
        proxyConfig.forEach(function(entry) {
            entry.agent = agent;
        });
    }
    return proxyConfig;
}

module.exports = setupForCorporateProxy(proxyConfig);
