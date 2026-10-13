# MPPSI school website and accounting portal

A pnpm monorepo with two Next.js applications and shared API, PostgreSQL schema, and UI packages.

| Workspace | Purpose | Development URL |
| --- | --- | --- |
| apps/website | Public school website and student/staff/admin portals | http://localhost:3001 |
| apps/accounting | Internal accounting portal | http://localhost:3002 |
| packages/api | Authentication, authorization and business actions/queries | Shared |
| packages/db | Drizzle schema, migrations and database transport | Shared |
| packages/ui | Shared UI components | Shared |

## Local setup in WSL

Use the Node version in .nvmrc and the pnpm version declared in the root package.json.

```sh
source /home/alfred/.nvm/nvm.sh
nvm use
pnpm install --frozen-lockfile
```

Configure one ignored .env.local file at the repository root with DATABASE_URL and JWT_SECRET. Both applications and database tooling load this shared file. Existing shell or hosting environment variables take precedence. Keep scripts/.env.sandbox separate for sandbox tests; app commands do not load it. Use .env.example as a variable reference; replace its sample values. Never commit environment files or credentials.

```sh
pnpm dev
# In another terminal:
pnpm dev:accounting
```

Accounting access requires an admin account or staff in the accounting department. The website has department-specific staff, admin and student portals.

## Checks

```sh
pnpm lint
pnpm --filter website exec tsc --noEmit
pnpm --filter accounting exec tsc --noEmit
pnpm test:unit
```

The unit command excludes packages/api/test and packages/db/test. Some tests in those directories mutate a sandbox database; others are explicit opt-in disposable PostgreSQL tests. See [testing instructions](scripts/test/README.md) and [database recovery verification](packages/db/test/RECOVERY_TESTING.md).

## Builds and migrations

```sh
pnpm build
pnpm --filter accounting build
```

The root build runs the website build. Both application builds run `db:migrate:production` before building Next.js. Automatic migrations run only when the shell or hosting environment supplies `VERCEL_ENV=production`; local, CI and Vercel preview builds skip the migration step without opening a database connection. The gate is checked before loading `.env.local`, so setting `VERCEL_ENV` in that file does not enable automatic migrations. Next.js builds may still query the database while rendering pages.

For deployments outside Vercel, apply reviewed migrations explicitly before deploying either app:

```sh
pnpm db:migrate
```

Manual migrations run in any environment and load the root `.env.local`. Inspect the configured database before running them or a Vercel production build; schema changes affect both applications. See [deployment guidance](docs/deployment.md) for migration preflight checks.

Migration source: packages/db/src/schema/. Migration files: packages/db/drizzle/. The Drizzle config and migration runner load the root .env.local using paths resolved from their own files. App dev, build and start scripts also load it; the file is optional when hosting supplies the environment variables.

## Current scope and documentation

Forms is the only remaining accounting feature confirmed by the owner. Invoice/payment overview placeholder routes are not current deliverables. Payroll deductions and loan payment posting are described in [accounting workflows](docs/accounting.md).

- [Deployment and handover](docs/deployment.md)
- [Testing and CI](scripts/test/README.md)
- [Database recovery verification](packages/db/test/RECOVERY_TESTING.md)
- [Fix and feature checklist](docs/FIX-TRACKER.md)
- [Repository audit and fix history](REPO-AUDIT.md)

Protected requests validate current account state and permissions. Password updates invalidate existing tokens. Deploy migrations 0015–0018 in journal order before deploying either app with the updated authentication source. Migration 0018 adds users.session_version for permanent archive session revocation; the password-fingerprint change itself needs no schema change. Existing users must sign in again after the session-validation deployment. See docs/deployment.md for target-database checks.
