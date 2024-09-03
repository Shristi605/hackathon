const express = require('express');
const https = require('https');
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API route to fetch data from a URL
app.get('/fetch', (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const fetchUrl = queryObject.url;

  if (!fetchUrl) {
    res.status(400).send('URL query parameter is required');
    return;
  }

  const client = fetchUrl.startsWith('https') ? https : http;

  client.get(fetchUrl, (externalRes) => {
    let data = '';

    externalRes.on('data', (chunk) => {
      data += chunk;
    });

    externalRes.on('end', () => {
      // Split the content by lines and return as HTML
      const lines = data.split('\n').map(line => `<p>${line}</p>`).join('');
      res.send(lines);
    });
  }).on('error', (err) => {
    console.error('Error fetching data:', err);
    res.status(500).send('Error fetching data');
  });
});

// Serve the HTML file for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
