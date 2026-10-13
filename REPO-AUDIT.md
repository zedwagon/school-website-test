# Repository audit and fix status

Updated 2026-10-03 on codex/forms-and-fixes. Scope: website, accounting, shared API/database/UI, tests, documentation and deployment configuration. Findings were identified by source review; only the explicitly listed checks have been run.

## Current feature scope

Forms is the only remaining accounting feature confirmed by the owner. Invoice/payment overview routes are leftover placeholders, absent from the sidebar, and are not missing agreed deliverables. Manual posting of payroll loan payments is intentional; see docs/accounting.md. Public registrar PDF downloads have matching assets and are separate from accounting Forms.

## Addressed findings

| Original finding | Resolution |
| --- | --- |
| 1. Section mutations lacked authorization | Registrar/admin checks in actions and callable queries; unauthorized callers cannot access the database. |
| 2. Existing sessions retained revoked privileges | Fresh account/profile checks and keyed password fingerprint; account archival, permission changes and password updates invalidate old tokens. |
| 3. Grade writes accepted unrelated students/subjects/years | Validate full batch against section ownership, active roster/subjects and matching year; transactional saves with a section lock. |
| 4. Teacher editing could target non-faculty accounts | Restrict targets to staff with faculty or legacy null department, verify linked account ID and lock it within the transaction. |
| 5. Concurrent saves could duplicate daily receipts/deposits | Unique receipt dates and receipt/ledger linkage with atomic upserts; consistent bulk lock order. Migration 0015 applied to configured app database. |
| 6. Exact final loan payments could fail floating-point comparisons | Compare and sum integer cents; verified 1.00 principal repaid by 0.90 plus 0.10. |
| 7. Payroll net could disagree with stored components | Calculate earnings/deductions/net in cents after rounding half salary; unchanged edits preserve generated net. |
| 8. Payroll period dates and uniqueness were incomplete | Valid calendar dates and ordering; unique names/date pairs and a database ordering check. Migration 0016 applied to configured app database. |
| 9. Rollover could leave partial or duplicate section copies | Transactional copying, stable school-year locks, and matching target-section skips. Existing target settings are preserved. |
| 10. Archived years could remain active | Active-year archival is blocked; activation validates the target before changing state. One-active-year and unarchived-active constraints require migration 0017. |

## Remaining scope decision

### 11. Production export still includes shared accounting source — scope dependent

.github/workflows/prod-sync.yml removes apps/accounting but leaves shared API/schema/migrations. This only needs changing if the owner still requires withholding private accounting source from the client repository. The old turnover checklist is not evidence of current commercial scope. Recommendation after dependency review: retain the current export. Full withholding needs separate packages/migration histories and an independent website build; docs/deployment.md records the reasoning.

## Documentation cleanup

README.md now describes the monorepo, actual ports/runtime, environment configuration and build/test commands. scripts/test/README.md now reflects Biome, CI unit tests and the actual optional wrapper. Agent docs use current database paths and port 3001. Completed/stale temporary-todo.md and operational-cash-flow-plan.md were removed after preserving useful information in docs/accounting.md and docs/deployment.md. Ignored local notes under tmp/ were preserved.

## Latest verification

- Unit suite: 229 tests passed across 42 files.
- Real accounting/school-year and enrollment integration suites: 68 tests passed (26 accounting/school-year and 42 enrollment) against disposable local PostgreSQL, including actual Drizzle migrations, receipt concurrency/rollback and exact-cent calculations. No configured Neon database was accessed by these tests.
- Website and accounting TypeScript checks passed.
- Biome passed with 40 existing warnings; git diff --check passed.
- Read-only authenticated browser smoke checks covered admin/registrar, school-year/rollover controls, payroll/new-period controls, contracts, receipts, ledger and loans. Core Part 1 public-site, Part 2 enrollment and Part 3 accounting browser walkthroughs and mutation retests are complete in isolated local QA; see docs/QA-TRACKER.md and docs/QA-PART3.md for exact coverage and deferred checks. Dependency advisory checks and production deployment checks remain outstanding.
- Migrations 0015–0017 applied to the configured shared app database after zero-conflict preflight; history verified through 0017. Read-only verification on 2026-10-03 found neither the 0018 migration hash nor users.session_version on that configured database; it still requires 0018 before updated authentication is deployed. No migration was run by this verification. Other deployment targets still need their own checks.
- The standard website build runs migrations, so it has not been run against a configured database during this work.

## Deployment effects

Existing sessions must log in again after the session fix. Apply migrations 0015–0018 in journal order before deploying either app; 0018 adds users.session_version, which the updated authentication query requires. Verify migration history on each deployment target before rollout; existing duplicate financial rows must be reviewed rather than automatically removed. Existing finalized payrolls are not recalculated. Manual payroll-to-loan payment posting remains the intended workflow.

Progress checklist: docs/FIX-TRACKER.md. Redundant accounting saves and utility copies were consolidated, with real concurrency regression coverage. The migration runner now reuses the working app transport. Browser review also found an existing reversed school-year date range and no currently active school year; these follow-ups are tracked without altering stored records.
