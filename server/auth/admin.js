import crypto from 'node:crypto';

function configuredCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || ''
  };
}

export function authenticateAdmin(username, password) {
  const configured = configuredCredentials();
  if (!configured.password) return { authenticated: false, reason: 'ADMIN_PASSWORD is not configured' };

  const validUser = username === configured.username;
  const validPassword = password === configured.password;

  if (!validUser || !validPassword) return { authenticated: false, reason: 'Invalid credentials' };

  return {
    authenticated: true,
    token: crypto.randomBytes(32).toString('hex')
  };
}

export function requireAdmin(request) {
  const token = request?.headers?.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return { authenticated: false, reason: 'Missing bearer token' };

  // Demo boundary: token validation is intentionally process-local.
  const valid = request?.adminTokens?.has?.(token);
  return valid
    ? { authenticated: true }
    : { authenticated: false, reason: 'Invalid or expired admin session' };
}
