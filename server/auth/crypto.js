import crypto from 'node:crypto';

const iterations = 120000;
const keyLength = 64;
const digest = 'sha512';

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, keyLength, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export function verifyPassword(password, encoded) {
  if (!encoded || !encoded.startsWith('scrypt$')) return false;
  const [, salt, expected] = encoded.split('$');
  const actual = crypto.scryptSync(password, salt, keyLength, { N: 16384, r: 8, p: 1 }).toString('hex');
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function signSession(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifySession(token, secret) {
  if (!token || !secret) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() >= payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
