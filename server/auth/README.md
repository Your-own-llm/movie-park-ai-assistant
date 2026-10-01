# Admin Authentication

The admin boundary uses environment credentials:

- ADMIN_USERNAME
- ADMIN_PASSWORD

A successful login creates a process-local session token.

Protected admin operations require that token.

This is a demo/deployment boundary, not a complete production identity system. For production, use a managed identity provider or signed, expiring sessions with secure cookies, CSRF protection, rate limiting, audit logging and secret management.
