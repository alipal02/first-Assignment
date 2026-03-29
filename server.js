const http = require('http');
const fs = require('fs');
const path = require('path');
const apiHandler = require('./Back/api');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
    // 1. Handle API Endpoints via custom router
    if (req.url.startsWith('/movies')) {
        return apiHandler(req, res);
    }

    // 2. Serve Frontend Static Files from 'Front' directory
    let reqPath = req.url === '/' ? 'index.html' : req.url;
    reqPath = reqPath.split('?')[0].replace(/^\/+/, '');
    const absolutePath = path.join(__dirname, 'Front', reqPath);
    const extname = String(path.extname(absolutePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(absolutePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`<h1>404 Not Found</h1><p>The file ${req.url} does not exist.</p>`, 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}/`);
});
