# MediCartix

Monorepo with:
- `Backend/` (Node.js + Express + MongoDB API)
- `frontend/` (customer UI)
- `admin/` (admin panel UI)

## Backend setup

From `Backend/`:

1) Install deps: `npm install`
2) Create env file: copy `.env.example` to `.env` and fill values
3) Run dev server: `npm run dev` (or `npm start`)

### Backend env vars

- `MONGO_URL` (MongoDB connection string)
- `JWT_SECRET` (JWT signing secret)
- `ADMIN_EMAILS` (comma-separated emails allowed to access admin order APIs)
- `CORS_ORIGIN` (comma-separated origins; leave blank to allow all)
- `FORCE_IPV4` (`true`/`false`; only enable if your host needs IPv4-first DNS)
- `DNS_SERVERS` (optional comma-separated DNS servers, e.g. `8.8.8.8,8.8.4.4`)

## Important security note

If you ever committed real secrets (database password, JWT secret, API keys), rotate them immediately and remove them from git history before redeploying.

## Git cleanup (recommended before redeploy)

This repo now ignores `node_modules/` and `.env*`, but if they were already committed you must untrack them once:

- Untrack backend env: `git rm --cached Backend/.env`
- Untrack dependencies (if committed): `git rm -r --cached Backend/node_modules admin/node_modules frontend/node_modules`
