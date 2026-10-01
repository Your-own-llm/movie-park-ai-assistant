import { createSession, hasSession, sessionUser } from './session.js';

export function authenticateAdmin(username, password) {
  return createSession(username, password);
}

export function requireAdmin(token) {
  const user = sessionUser(token);
  return user ? { authenticated: true, user } : { authenticated: false, reason: 'Invalid or expired admin session' };
}

export { hasSession };
