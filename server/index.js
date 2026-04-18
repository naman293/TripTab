import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT || 8787);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const sample = {
  name: 'TripTab API',
  status: 'ok',
  endpoints: ['/health', '/api/meta', '/api/ping']
};

const json = (res, code, data) => {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
};

const contentType = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  return 'text/plain; charset=utf-8';
};

const serveFile = (res, filePath) => {
  res.writeHead(200, { 'Content-Type': contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
  if (!req.url) return json(res, 400, { error: 'Bad request' });
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });

  if (req.url === '/health') return json(res, 200, { status: 'ok', service: 'triptab-api' });
  if (req.url === '/api/meta') return json(res, 200, sample);
  if (req.url === '/api/ping') return json(res, 200, { pong: true, at: new Date().toISOString() });

  if (fs.existsSync(distDir)) {
    const normalized = req.url === '/' ? '/index.html' : req.url;
    const target = path.resolve(distDir, `.${normalized}`);
    if (target.startsWith(distDir) && fs.existsSync(target) && fs.statSync(target).isFile()) {
      return serveFile(res, target);
    }

    const spaFallback = path.join(distDir, 'index.html');
    if (fs.existsSync(spaFallback)) return serveFile(res, spaFallback);
  }

  return json(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`[triptab-api] running on http://localhost:${port}`);
});
