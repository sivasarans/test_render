// Import the HTTP module
const http = require('http');

// Define the port to listen on
const PORT = 3000;

// Create the server
const server = http.createServer((req, res) => {
    // Log the request method and URL
    console.log(`Received ${req.method} request for: ${req.url}`);

    // Set the response header and content
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
