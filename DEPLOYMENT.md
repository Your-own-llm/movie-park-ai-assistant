# Deployment

## 1. Install

```bash
npm install
```

## 2. Create the admin password hash

```bash
npm run admin:hash -- "YOUR-STRONG-ADMIN-PASSWORD"
```

Put the output in `ADMIN_PASSWORD_HASH`. Do not commit the password or hash to Git.

## 3. Configure secrets

Set:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `DATABASE_URL`

Generate a long random `ADMIN_SESSION_SECRET` with your hosting provider's secret manager or a cryptographically secure generator.

## 4. Database

When `DATABASE_URL` is present, the app initializes the Postgres `inquiries` table automatically at startup.

Without `DATABASE_URL`, it uses `movie-park-inquiries.json` as a local/demo fallback.

## 5. Start

```bash
npm start
```

The server exposes the frontend and API from the same process.

## Security notes

- Never commit `.env`, passwords, password hashes, database credentials, or session secrets.
- Use HTTPS in production.
- Put the application behind a platform with TLS and standard request/rate-limit controls.
- The signed admin session expires after 8 hours.
- For multi-user production access, replace the single-admin credential model with a managed identity provider.
