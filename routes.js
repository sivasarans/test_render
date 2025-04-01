// routes.js
const url = require('url');

function handleRoutes(req, res) {
    const parsedUrl = url.parse(req.url, true);
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    if (parsedUrl.pathname === '/') {
        res.end('Hello, this is the Home Page!\n');
    } else if (parsedUrl.pathname === '/test1') {
        res.end('Welcome to /test1 API\n');
    } else if (parsedUrl.pathname === '/test2') {
        res.end('Welcome to /test2 API\n');
    } else if (parsedUrl.pathname === '/about') {
        res.end('This is the About Page!\n');
    } else if (parsedUrl.pathname === '/contact') {
        res.end('This is the Contact Page!\n');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found\n');
    }
}

module.exports = handleRoutes;
