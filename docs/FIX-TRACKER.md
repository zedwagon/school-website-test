# Fix and feature tracker

Updated 2026-10-03. Branch: codex/forms-and-fixes.

## Completed and committed

- [x] Protect section, schedule and roster mutations; restrict teacher targets. Commit d90b9cc1.
- [x] Revoke sessions after account/permission/password changes. Commit 9bcfdd0e.
- [x] Validate grade membership and save batches atomically. Commit 69829618.
- [x] Refresh setup/test/agent docs; consolidate obsolete plans. Commit 9b710181.
- [x] Prevent duplicate receipts and calculate loan/payroll amounts in integer cents. Commit 4600f78f.

## Additional completed fixes

- [x] Validate payroll period dates and prevent duplicate periods, including concurrent creation. Commit a2262b81; migration 0016 applied to the configured app database.
- [x] Make school-year rollover atomic and prevent repeated imports from duplicating sections. Commit 2e943ce7; verified with real rollback and concurrent-retry tests.
- [x] Prevent archived school years from remaining active; preserve active-year state on invalid activation. Migration 0017 applied to the configured app database.
- [x] Add focused regression tests and commit payroll/academic changes separately.

## Redundancy cleanup

- [x] Replace duplicated opening-balance and employee-contract insert/update branches with atomic upserts. Add real concurrent-first-save tests and partial-contract-update coverage. Commit e71a8927.
- [x] Delegate payroll status updates to the existing period-update function.
- [x] Share class-name/date helpers in packages/ui; remove unused accounting staff-image helper and duplicate utility tests.
- [x] Use the app database transport in the migration runner; standard db:migrate succeeds. Commit 9dc3337b.
- [x] Keep authorization checks at callable entry points and generated Next.js files; these are intentional.

## Remaining decisions and feature work

- [ ] Add accounting Forms when its required documents and behavior are specified. This is the only remaining accounting feature confirmed by the owner.
- [x] Review production export dependencies. Recommendation: retain the current export. Shared schema exports and migration history include accounting; full withholding requires package/migration separation and an independently verified website build. Production export now also excludes docs/; shared accounting source remains included.

## Deployment and verification

- [x] Run receipt, payroll-period and active-school-year preflight checks on the configured app database: zero conflicts.
- [x] Apply migrations 0015–0017 to the database configured by apps/website/.env (also used by accounting). Verified 18 migration-history entries through 0017. Other deployment targets still require their own preflight/migration.
- [x] Read-only browser smoke checks: admin/registrar, school years and rollover dialog, payroll/new-period dialog, contracts, receipts, ledger and loans.
- [x] Complete core browser mutation checks for permissions/session revocation, grade save/clear, financial saves and school-year lifecycle in isolated local QA. Detailed coverage and remaining limits are in QA-TRACKER.md and QA-PART3.md. No production records were used for these mutations.
- [ ] Apply migration 0018 and verify migrations 0015–0018 in journal order on each intended deployment database before deploying either updated app. Read-only check on 2026-10-03: the database configured by apps/website/.env has neither the 0018 migration hash nor users.session_version. No migration was run during this check.
- [x] Push codex/forms-and-fixes for pull-request review.
- [ ] Deploy when requested; existing users must sign in again after the session fix.

## Staged browser walkthrough

- [x] Complete Part 1 public website checks. See [QA-TRACKER.md](QA-TRACKER.md) for all 26 pages, individual test steps, open findings and Parts 2/3 checklists.
- [x] Fix and retest requested Part 1 mobile navigation, title layout and keyboard/accessibility issues. Contact placeholder updated to `09XXXXXXXXX`; public fees deferred unchanged for client discussion. Detailed retest results are in QA-TRACKER.md.

- [x] Complete Part 2 core enrollment walkthrough and regression retests; physical printing deferred by the owner. See QA-TRACKER.md and ENROLLMENT-FUTURE-FOLLOWUPS.md.
- [x] Complete Part 3 core accounting walkthrough, report authorization, exact-cent and mobile retests. See QA-PART3.md and ACCOUNTING-FUTURE-FOLLOWUPS.md.

## Newly observed follow-ups

- [ ] Add calendar/date-order validation for school-year creation and editing. One existing row has start 2026-09-09 and end 2026-09-02; review its intended dates with the owner before correcting stored data.
- [ ] Owner to choose the intended active school year: the configured database currently has none. No automatic activation was performed.

## Latest checks

229 unit tests across 42 files and 68 disposable PostgreSQL integration tests passed (26 accounting/school-year and 42 enrollment), rerun during the whole-PR review on 2026-10-03. Both app type checks and the migration-runner type check passed. Lint passes with 40 existing warnings. Configured database migrations were applied as described above. Branch changes were pushed and PR #41 is open; no deployment was made.
