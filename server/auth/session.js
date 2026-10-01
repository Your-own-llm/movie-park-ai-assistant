import { authenticateAdmin } from './admin.js';

const sessions = new Set();

export function createSession(username, password) {
  const result = authenticateAdmin(username, password);
  if (!result.authenticated) return result;

  sessions.add(result.token);
  return { authenticated: true, token: result.token };
}

export function hasSession(token) {
  return Boolean(token && sessions.has(token));
}

export function destroySession(token) {
  sessions.delete(token);
}
