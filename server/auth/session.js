import { verifyPassword, signSession, verifySession } from './crypto.js';

const TTL_MS = 8 * 60 * 60 * 1000;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

export function createSession(username, password) {
  const configuredUser = process.env.ADMIN_USERNAME || 'admin';
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || '';

  if (!secret() || !passwordHash) {
    return { authenticated: false, reason: 'Admin authentication is not configured' };
  }

  if (username !== configuredUser || !verifyPassword(password, passwordHash)) {
    return { authenticated: false, reason: 'Invalid credentials' };
  }

  const token = signSession({
    sub: username,
    iat: Date.now(),
    exp: Date.now() + TTL_MS
  }, secret());

  return { authenticated: true, token, expiresAt: Date.now() + TTL_MS };
}

export function hasSession(token) {
  return Boolean(verifySession(token, secret()));
}

export function sessionUser(token) {
  return verifySession(token, secret());
}

export function destroySession() {
  // Signed stateless sessions expire naturally.
  return true;
}
