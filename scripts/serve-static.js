'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8090);
const HOST = process.env.HOST || '127.0.0.1';
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function resolveRequestPath(rawUrl) {
  const pathname = decodeURIComponent(new URL(rawUrl, `http://${HOST}:${PORT}`).pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = path.resolve(ROOT, relative);
  return target === ROOT || target.startsWith(`${ROOT}${path.sep}`) ? target : null;
}

const server = http.createServer((request, response) => {
  const target = resolveRequestPath(request.url || '/');
  if (!target) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }
  fs.stat(target, (error, stat) => {
    if (error || !stat.isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
    });
    fs.createReadStream(target).pipe(response);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Shike static server: http://${HOST}:${PORT}/index.html`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
