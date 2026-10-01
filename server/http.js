import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL } from 'node:url';
import { createSession, destroySession } from './auth/session.js';
import { listInquiries, getInquiry, assignInquiry, markInquiryContacted } from './admin/api.js';
import { runWithProvider } from './agents/provider.js';
import { inquiryStore, initializeStore } from './db/store.js';
import { researchPublicSource } from './research/index.js';

function json(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS'
  });
  res.end(JSON.stringify(body));
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function token(req) {
  return req.headers.authorization?.replace(/^Bearer\s+/i, '');
}

let initializationPromise;

async function ensureInitialized() {
  if (!initializationPromise) {
    initializationPromise = initializeStore().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }
  return initializationPromise;
}

export default async function handler(req, res) {
  try {
    await ensureInitialized();

    if (req.method === 'OPTIONS') return json(res, 204, {});

    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/health' && req.method === 'GET') {
      return json(res, 200, { ok: true });
    }

    if (url.pathname === '/api/admin/login' && req.method === 'POST') {
      const b = await body(req);
      const result = createSession(b.username, b.password);
      return result.authenticated
        ? json(res, 200, { ok: true, token: result.token })
        : json(res, 401, { ok: false, error: result.reason });
    }

    if (url.pathname === '/api/admin/logout' && req.method === 'POST') {
      destroySession(token(req));
      return json(res, 200, { ok: true });
    }

    if (url.pathname === '/api/ai/intake' && req.method === 'POST') {
      const result = await runWithProvider((await body(req)).input || {});
      return json(res, 200, { ok: true, ...result });
    }

    if (url.pathname === '/api/research/public' && req.method === 'POST') {
      const b = await body(req);
      if (!b.url) return json(res, 400, { ok: false, error: 'url is required' });
      const result = await researchPublicSource(b.url);
      return json(res, result.accepted === false ? 400 : 200, { ok: true, ...result });
    }

    if (url.pathname === '/api/inquiries' && req.method === 'POST') {
      const result = await runWithProvider((await body(req)).input || {});
      const saved = await inquiryStore.createInquiry(result.handoff);
      return json(res, 200, { ok: true, inquiryId: saved.id, ...result });
    }

    if (url.pathname === '/api/admin/inquiries' && req.method === 'GET') {
      const result = await listInquiries(token(req));
      return json(res, result?.status === 401 ? 401 : 200, result);
    }

    const match = url.pathname.match(/^\/api\/admin\/inquiries\/([^/]+)$/);
    if (match) {
      const id = match[1];

      if (req.method === 'GET') {
        const result = await getInquiry(id, token(req));
        return json(res, result?.status === 401 ? 401 : 200, result);
      }

      if (req.method === 'PATCH') {
        const b = await body(req);
        const t = token(req);
        const result = b.action === 'contact'
          ? await markInquiryContacted(id, t)
          : await assignInquiry(id, b.assignedTo, t);
        return json(res, result?.status === 401 ? 401 : 200, result);
      }
    }

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname.startsWith('/phase2.js'))) {
      const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
      const file = url.pathname === '/' ? path.join(root, 'index.html') : path.join(root, url.pathname.slice(1));

      try {
        const data = await fs.readFile(file);
        res.writeHead(200, {
          'Content-Type': url.pathname.endsWith('.js')
            ? 'application/javascript'
            : 'text/html'
        });
        return res.end(data);
      } catch {}
    }

    return json(res, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
}

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT || 3000);
  const server = http.createServer(handler);
  server.listen(port, () => {
    console.log('Movie Park AI Assistant API listening on ' + port);
  });
}
