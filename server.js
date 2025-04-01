const http = require('http');
const handleRoutes = require('./routes'); // Import the routes.js file

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`Received ${req.method} request for: ${req.url}`);
    handleRoutes(req, res);
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
