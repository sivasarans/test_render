const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`Received ${req.method} request for: ${req.url}`);

    res.writeHead(200, { 'Content-Type': 'text/plain' });

    if (req.url === '/') {
        res.end('Hello, World!\n');
    } else if (req.url === '/test1') {
        res.end('You reached /test1\n');
    } else if (req.url === '/test2') {
        res.end('You reached /test2\n');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found\n');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
