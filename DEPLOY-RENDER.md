# Creative Carnival — Render + Aiven deployment

## Architecture

- Frontend: GitHub Pages at `https://udaykarthy1801-art.github.io/club/`
- Backend: Render Web Service (Node.js + Express)
- Database: Aiven for MySQL

## 1. Create the backend repository

Create a separate GitHub repository, for example `creative-carnival-backend`, and upload the contents of this project. Do not upload a real `.env` file.

## 2. Aiven MySQL

Create a MySQL service and database named `creative_carnival`.
Download the Aiven CA certificate as `aiven-ca.pem`.
Run `database/schema.sql` against the production database before starting the API.
Create/use a dedicated non-root application user with only SELECT, INSERT, UPDATE, DELETE permissions on `creative_carnival`.

## 3. Render Web Service

Connect the backend GitHub repository and create a **Web Service**.

- Runtime: Node
- Build command: `npm ci --omit=dev`
- Start command: `npm start`
- Health check: `/api/health`
- Plan: Free for testing/hobby use

Render provides the `PORT` value. Set `HOST=0.0.0.0`.

## 4. Render environment variables

Set these in Render Environment:

```text
NODE_ENV=production
HOST=0.0.0.0
DB_HOST=<Aiven host>
DB_PORT=<Aiven port>
DB_USER=<Aiven application user>
DB_PASSWORD=<Aiven password>
DB_NAME=creative_carnival
DB_CONNECTION_LIMIT=10
DB_SSL_CA=/etc/secrets/aiven-ca.pem
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<generated with npm run admin:password>
SESSION_HOURS=8
ALLOWED_ORIGINS=https://udaykarthy1801-art.github.io
COOKIE_SECURE=true
COOKIE_SAMESITE=none
REGISTRATION_RATE_LIMIT=60
REGISTRATION_RATE_WINDOW_MINUTES=15
```

Do not put passwords or hashes into GitHub.

## 5. Aiven CA secret file

In Render: Environment -> Secret Files -> Add Secret File.

Filename:

```text
aiven-ca.pem
```

Paste the downloaded Aiven CA certificate. Render exposes it at:

```text
/etc/secrets/aiven-ca.pem
```

## 6. Admin password hash

On a trusted local machine, from the project root:

```powershell
npm install
npm run admin:password
```

Enter the admin password when prompted and copy the resulting `scrypt$...` hash into Render as `ADMIN_PASSWORD_HASH`.

Never put the plaintext password or `.env` in GitHub.

## 7. Database schema

Run the contents of `database/schema.sql` on Aiven. Confirm both tables exist:

```sql
SHOW TABLES;
```

Expected:

```text
admin_sessions
registrations
```

## 8. After Render deploys

The API health URL will be:

```text
https://<your-render-service>.onrender.com/api/health
```

It should return JSON with `success: true` and `database: "connected"`.

## 9. Connect GitHub Pages to the backend

Edit:

```text
public/js/api-config.js
```

Change:

```js
window.CREATIVE_CARNIVAL_API_BASE_URL = 'https://REPLACE_WITH_YOUR_RENDER_SERVICE.onrender.com';
```

to the exact Render HTTPS URL, then upload the updated `api-config.js` to the GitHub Pages `club` repository.

The frontend already uses that base URL for registration and admin API requests.

## 10. Admin session requirement

Because GitHub Pages and Render are different sites, the production admin session cookie is configured as:

- `HttpOnly`
- `Secure`
- `SameSite=None`
- `Path=/`

The frontend sends admin API requests with `credentials: include`, and the backend CORS allow-list is restricted to the GitHub Pages origin.

## 11. Test order

1. Open `/api/health`.
2. Open the GitHub Pages registration page.
3. Submit one test registration.
4. Confirm the registration appears in MySQL.
5. Open `/club/admin.html`.
6. Sign in.
7. Confirm the registration appears in the dashboard.
8. Test filtering, detail view, CSV export, and deletion.
9. Remove any test visitor data.
