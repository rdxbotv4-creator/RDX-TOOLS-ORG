const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const baseDir = path.join(__dirname);

app.use(express.static(baseDir, {
  maxAge: '1d',
  etag: false
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(baseDir, 'index.html'));
});

app.get('/*.html', (req, res) => {
  res.sendFile(path.join(baseDir, req.path));
});

app.get('/assets/*', (req, res) => {
  const filePath = path.join(baseDir, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.get('/tools/*', (req, res) => {
  const filePath = path.join(baseDir, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(baseDir, 'index.html'));
});

module.exports = app;
