#!/usr/bin/env node

/**
 * Simple documentation server for Bouncer Backend.
 * Serves TypeDoc generated documentation with proper MIME types and fallbacks.
 */

const path = require('path');
const fs = require('fs');

const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'api');

// Check if docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
  console.error('❌ Documentation not found. Please run "npm run docs:generate" first.');
  process.exit(1);
}

// Serve static files with proper headers
app.use(
  express.static(DOCS_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    },
  })
);

// Fallback to index.html for SPA-like behavior
app.get('*', (req, res) => {
  const indexPath = path.join(DOCS_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
            <html>
                <head><title>Documentation Not Found</title></head>
                <body>
                    <h1>Documentation Not Found</h1>
                    <p>Please generate documentation first:</p>
                    <code>npm run docs:generate</code>
                </body>
            </html>
        `);
  }
});

app.listen(PORT, () => {
  console.log(`📚 Documentation server running at http://localhost:${PORT}`);
  console.log(`📂 Serving files from: ${DOCS_DIR}`);
  console.log('Press Ctrl+C to stop the server');
});
