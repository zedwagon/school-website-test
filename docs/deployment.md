# Deployment and handover

This guide describes the repository configuration; it does not establish that any client account, repository, database, or domain has already been provisioned.

## Repository mirrors

Pushes to main can run .github/workflows/staging-sync.yml and prod-sync.yml. Staging uses STAGING_REPO_PATH and STAGING_GITHUB_TOKEN; production uses PROD_REPO_PATH and PROD_GITHUB_TOKEN. Missing secrets cause the corresponding mirror to skip. Mirrors recreate Git history and force-push the target repository, so configure targets dedicated to these exports.

The staging export removes scripts, .agents and .github. The production export additionally removes apps/accounting, its development script and the entire docs/ folder. Internal QA trackers and future follow-up notes stay in this source repository. It still includes shared accounting API/schema/migrations. Current recommendation: keep this working export. The website consumes a shared schema barrel that includes accounting, and the migration journal contains its history. Fully withholding accounting requires separating those packages and migration histories, then verifying an independent website build; deleting folders blindly can break builds or future migrations. Removing the app alone does not withhold all accounting source.

## Database and app deployment

- Provision or confirm the intended production database, with reviewed migrations and an appropriate backup/restore plan. Do not blindly copy development users, test records or accounting data into a client database.
- Deploy the website with root directory apps/website. Deploy accounting separately with apps/accounting when within the agreed scope.
- Configure DATABASE_URL and JWT_SECRET on each app. Authentication is custom signed JWT cookies, not NextAuth. Keep environment values and mirror tokens outside Git.
- The standard website build runs migrations using the configured database. Review schema changes before deployment. The accounting build does not migrate.
- Verify authorized and unauthorized access, public pages, accounting workflows and print output after deployment. Configure the intended domain and confirm access/ownership handover separately.
- Existing sessions must log in again after deployment of the password-fingerprint session fix.

These steps supersede the old temporary todo/turnover checklist. Commercial terms and ownership arrangements must come from the owner rather than historical implementation notes.

## Receipt uniqueness migration

Migration 0015_workable_smiling_tiger adds unique constraints on accounting.daily_cash_receipts.date and accounting.operational_cash_flow.receipt_id. Existing duplicate financial rows must be reviewed before applying it. These read-only checks identify collisions:

```sql
SELECT date, count(*) FROM accounting.daily_cash_receipts GROUP BY date HAVING count(*) > 1;
SELECT receipt_id, count(*) FROM accounting.operational_cash_flow WHERE receipt_id IS NOT NULL GROUP BY receipt_id HAVING count(*) > 1;
```

Do not merge or delete financial entries automatically. Resolve confirmed duplicates with the owner, keeping a backup and an explanation of the adjustment. Constraint creation fails if collisions remain. Apply the migration before deploying the receipt upsert code; it relies on the new constraints. On 2026-10-02, clean preflight checks were run and migrations 0015–0017 were applied to the database configured in apps/website/.env, also used by accounting. This does not establish migration status for other deployment databases.

## Payroll period constraints

Migration 0016_fuzzy_shard requires unique names, unique start/end date pairs, and start_date <= end_date. Before applying it, review these read-only checks:

```sql
SELECT name, count(*) FROM accounting.payroll_periods GROUP BY name HAVING count(*) > 1;
SELECT start_date, end_date, count(*) FROM accounting.payroll_periods GROUP BY start_date, end_date HAVING count(*) > 1;
SELECT id, name, start_date, end_date FROM accounting.payroll_periods WHERE start_date > end_date;
```

Resolve legacy conflicts with the owner rather than deleting or merging periods automatically. Apply migrations 0015 and 0016 before deploying the accounting changes. Archived periods also retain their identity, so archiving does not permit a second period for the same dates or name.

## School-year integrity constraints

Migration 0017_windy_sharon_ventura enforces at most one active school year and prohibits active archived rows. Before applying it, review these read-only checks:

```sql
SELECT id, name, archived_at FROM school_years WHERE is_active = true;
SELECT id, name FROM school_years WHERE is_active = true AND archived_at IS NOT NULL;
```

If the first query returns more than one row or the second returns any rows, choose the intended active year with the owner and correct legacy state before migration. No academic rows are deleted or automatically reassigned. Apply generated migrations in journal order (0015, 0016, 0017) before deploying this branch.

Archiving an active year now requires activating another year first. Rollover requires different existing, unarchived source/target years; it runs transactionally and skips existing target sections with the same exact name and grade level, including archived matches. Existing target settings remain untouched. Disabling teacher copying clears both adviser and subject-teacher assignments on new copies. Student enrollments and grades are not copied by rollover.

The db:migrate script now runs the Drizzle migrator through the same recovering pool and WebSocket transport as the apps. Run `pnpm --filter @school/db db:migrate`; it loads the website environment without overriding already configured environment variables. Schema generation continues to use drizzle-kit.

## Archive session revocation

Apply `0018_broad_firedrake.sql` in migration journal order before deploying either app's new authentication source. It adds `users.session_version`, default zero. Student Directory, User Management and Teacher Management increment it with account archival. Restore retains the version, so pre-archive JWTs stay invalid and the restored user signs in again. Existing JWTs without a version represent zero and continue working for unaffected accounts; password fingerprint and fresh role/department checks still apply. This migration was tested only in isolated local QA; the configured remote database was not migrated during QA.
