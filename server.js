const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || process.env.PORT_NUMBER || 3000;

// Get the directory where server.js is located
const baseDir = __dirname;

// Serve static files from the root directory
app.use(express.static(baseDir));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(baseDir, 'index.html'));
});

// Serve all HTML files
app.get('*.html', (req, res) => {
    res.sendFile(path.join(baseDir, req.path));
});

// Serve assets (css, js, images)
app.get('/assets/*', (req, res) => {
    const filePath = path.join(baseDir, req.path);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Serve tools directory
app.get('/tools/*', (req, res) => {
    const filePath = path.join(baseDir, req.path);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Fallback to index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(baseDir, 'index.html'));
});

// Start the server
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Website can be accessed at:`);
    console.log(`  - http://localhost:${PORT}`);
    console.log(`  - http://127.0.0.1:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', error);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
