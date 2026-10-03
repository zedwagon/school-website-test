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

Configure ignored apps/website/.env and apps/accounting/.env files with DATABASE_URL and JWT_SECRET. The applications use the same database and authentication secret. Use .env.example as a variable reference; replace its sample values. Never commit environment files or credentials.

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

The root build runs the website build, which applies Drizzle migrations before building Next.js. The accounting build does not apply migrations. For compilation without migrations, use pnpm --filter website exec next build --turbopack. Inspect the configured database before using db:migrate or the standard website build; schema changes affect both applications.

Migration source: packages/db/src/schema/. Migration files: packages/db/drizzle/. The Drizzle config loads apps/website/.env when invoked from packages/db.

## Current scope and documentation

Forms is the only remaining accounting feature confirmed by the owner. Invoice/payment overview placeholder routes are not current deliverables. Payroll deductions and loan payment posting are described in [accounting workflows](docs/accounting.md).

- [Deployment and handover](docs/deployment.md)
- [Testing and CI](scripts/test/README.md)
- [Database recovery verification](packages/db/test/RECOVERY_TESTING.md)
- [Fix and feature checklist](docs/FIX-TRACKER.md)
- [Repository audit and fix history](REPO-AUDIT.md)

Protected requests validate current account state and permissions. Password updates invalidate existing tokens. Deploy migrations 0015–0018 in journal order before deploying either app with the updated authentication source. Migration 0018 adds users.session_version for permanent archive session revocation; the password-fingerprint change itself needs no schema change. Existing users must sign in again after the session-validation deployment. See docs/deployment.md for target-database checks.
