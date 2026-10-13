# Next QA session

Updated 2026-10-03. Branch: `codex/forms-and-fixes`. Existing PR: https://github.com/phase-sys/school-website-mpps/pull/41

## Current continuation state

On 2026-10-03, the old `/tmp` browser cluster was missing after shutdown. The QA database was recreated at ignored `tmp/qa-runtime/.qa-postgres`; old fixture IDs are historical evidence, not live records. Current synthetic users: 1 baseline Admin; 2 Resume Registrar (restored to Registrar after Guidance/Faculty checks); 3 Password Test; 4 Resume Admin (restored; fresh Admin login verified). School year QA 2026-2027, synthetic Grade 7 ESC student and QA Resume G7 section have been recreated through the UI. The Grade 7 form passed final approval after all clearances and was subsequently dropped for lifecycle testing; ESC set/reload/clear checks passed; roster removal/reassignment and section archive/restore passed with exactly one active assignment. Second-year QA 2027-2028 returning Grade 8 intake and old-year history isolation passed; no duplicate student/account. Catalog subject QA-MATH and both school years/section are restored. Grade 8 remains pending Clinic.

Website 3101 and local PostgreSQL/bridge 55442/55443 are running. Internal accounting 3102 was not started. From `tmp/qa-runtime`, `node qa-restart.mjs` restarts the retained local database/bridge after shutdown; start website with `pnpm --filter website exec next dev --turbopack -p 3101 --hostname 127.0.0.1`. Load NVM first. Do not rerun first-time bootstrap on the retained cluster.

Completed this continuation: account profile persistence, Registrar -> Guidance -> Faculty -> Registrar, fresh department landings and denial of tokens with stale permissions, Faculty no-active-year browser check, Administrator -> Clinic -> Administrator consistency, Admin profile edit/reload, Admin directory filter, archive exact-email validation, archived-session denial and deactivated-login rejection.

Three new fixes: P2-13 updates Administrator staff profiles; P2-14 targets the selected historical form on revoke; P2-15 permanently revokes pre-archive sessions. Latest checks: 42 workflow regressions, 223 unit tests, both app type checks and targeted lint/whitespace pass. P2-13 browser retest passed; P2-14 passes real API regressions; browser revoke is unavailable because the UI renders no revoke control. These changes are included in the current authorized commit/push checkpoint.

Owner completed password change for user 3; old-session revocation and old-password rejection passed. New-password login passed. The owner accepted the native Restore prompt; the account is active and fresh login works. The prior 127.0.0.1 session was revoked as expected. qa-admin.localhost is the working Admin session; qa-staff.localhost is the independent role/Registrar session. These hosts share the same local app/database but separate cookies.

The archive-session browser retest passed. Reconcile remaining coverage and review limits. Clinic and Guidance print pages have been inspected; physical printing is explicitly deferred by the owner. Do not mark Part 2 complete or start Part 3 yet.

## Agreed order

1. Restart and verify the isolated local QA environment.
2. Finish the remaining Part 2 enrollment coverage and review its results.
3. Begin Part 3 accounting only after the Part 2 checkpoint.
4. Keep Accounting Forms excluded until the owner supplies the documents.

Part 2 is **not fully complete**. Its core walkthrough and 12 prior fixes were tested; three additional fixes passed regressions in this continuation. Current verification: 42 real PostgreSQL workflow regressions, 223 unit tests, both app type checks and whitespace checks pass. The regression file passes Biome; the broader changed-file check has zero errors and 24 warnings. See [QA-TRACKER.md](QA-TRACKER.md) for execution evidence and limits.

## Restart safely

- Use the retained ignored `tmp/qa-runtime` copy, not the regular apps' remote database. QA website: `http://127.0.0.1:3101`; QA accounting: `http://127.0.0.1:3102`.
- The retained browser database is local PostgreSQL 18 on loopback 55442, connected through a local WebSocket bridge on 55443. It is not a Neon branch. The real Neon driver is used through that local bridge.
- The cluster directory is recorded in ignored `tmp/qa-runtime/qa-postgres-path.txt`. It now lives at `tmp/qa-runtime/.qa-postgres`; verify it and retained fixtures after shutdown. If missing, recreate an isolated cluster and synthetic fixtures rather than using the configured remote database.
- Inspect existing runtime files and process state before restarting PostgreSQL, the bridge and the QA website. Start the internal accounting app only after the Part 2 review. Previous terminal session IDs will no longer be usable after shutdown. Verify both apps point to the isolated database before any writes.
- Preserve runtime-only database transport, environment and CSS/root configuration. Sync committed product changes into the QA copy selectively; do not overwrite its environment with production configuration.
- Load WSL NVM and the version in `.nvmrc` before Node/pnpm commands. Continue browser testing through accessibility interactions, without Playwright.
- Retained fixture IDs and cleanup disposition are in QA-TRACKER.md. Keep passwords and environment secrets out of committed documentation. Retrieve generated student credentials through the authorized product flow when needed.

## Finish Part 2

- [ ] Complete remaining account/department-change and protected-access browser cases using synthetic accounts.
- [x] Owner performed password-change entry/submission; old-session revocation, old-password rejection and new-password sign-in passed. Generated student reset remains API-regression coverage.
- [x] Exercise supported browser lifecycle controls: new-year returning enrollment, roster removal/reassignment, and academic archive/restore. Same-form dropped restoration also has no rendered UI control and remains API-regression coverage. Revocation/reapproval is API-only: the tracking dialog renders no revoke control and only opens pending forms. Underlying actions already have regression coverage. Verify state after native confirmation before asking the owner to act again.
- [x] Test the ESC-number browser editor and persistence. Selected-form set/clear, other-year isolation and unauthorized-action rejection already pass regression tests.
- [ ] Finish remaining search/filter and history combinations, and inspect available print/download outputs. Separate print-preview verification from owner-operated physical printing.
- [x] Check no-active-year Faculty behavior in the browser; browser no-active-year behavior passed on 2026-10-03; real regression coverage also covers department empty queues and Registrar history.
- [ ] Record any newly confirmed defects, fix within scope, and rerun affected checks. Update the tracker with the method and actual result; do not claim every grade/field combination was tested.
- [ ] Review any deferred manual, mobile/cross-browser or production-environment checks explicitly before declaring Part 2 complete.
- [ ] Stop for the owner's Part 2 review before starting Part 3.

## Client decisions to retain separately

These are policy questions, not confirmed defects to fix without direction:

- After final enrollment, an API-only Accounting change to insufficient leaves enrollment/roster active and retains original approval metadata. The website selector does not offer insufficient. Confirm financial-hold versus revocation behavior and edit attribution.
- Confirm whether timetable overlaps should be prevented, warned about or allowed.
- Confirm Clinic unanswered-versus-No and female-only answer representation.
- Confirm whether the student portal should expose a historical-year selector and additional track/ESC/voucher details. Historical status works through the year URL parameter; current profile does not display every enrollment field.
- Public fee amounts remain unchanged pending client confirmation.

Detailed temporary notes are in ignored `tmp/enrollment-client-concerns.md` and `tmp/CLIENT-DISCUSSION-PUBLIC-FEES.md` when those files are available. The committed QA tracker retains the essential findings.

## Part 3 after review

- [ ] Inventory accounting tabs and role restrictions; use the synthetic Accounting/Admin accounts.
- [ ] Run every supported contract type through creation, edit, validation and reload.
- [ ] Test deductions, allowances, opening balances and contract history/status.
- [ ] Run payroll periods and verify amounts, duplicate/date validation and statuses.
- [ ] Test loans, balances, payments and the documented manual loan-payment posting workflow.
- [ ] Test receipts/items, duplicate numbering, filters and reports.
- [ ] Reconcile ledger entries and balances against synthetic operations.
- [ ] Check remaining tabs, print/export, permissions and persistence.
- [ ] Record findings and retest fixes, then stop for review. Forms remain deferred.

Automatic approval review previously blocked internal accounting access on port 3102 because it crossed the Part 2 checkpoint. Do not bypass that restriction; start those checks only after the agreed Part 2 review and authorization for Part 3. No real money, school records or client database data were changed in the isolated Part 2 tests.

## Git checkpoint

The owner requested committing and pushing tested Part 2 code and this next-session note before shutdown. Pushing is a backup/review checkpoint; it does not mean Part 2 is complete or authorize merging PR #41. Keep the PR open until the remaining stages are assessed.

## Archive-session fix — 2026-10-03

The browser found that restoring an account revived its unexpired pre-archive token. This is now fixed in source: `users.session_version` increments atomically with the user archive flag in Student Directory, User Management and Teacher Management. Login signs the current version; protected requests compare it with the stored version. Restore does not reset it. Tokens issued before this migration represent version zero and remain usable only until the first archive. Apply migration `0018_broad_firedrake.sql` before deploying either app; it has only been applied to isolated QA locally.

Session regressions verify archive denial, continued denial after restore, and fresh-login success. Real PostgreSQL regressions verify the persisted version across all three archive paths. Browser retest passed: archival denial, restored account active with unchanged old-session denial, and fresh student sign-in with pending Clinic status. User 5 retains session_version 1. No native prompt or owner input remains pending.

The continuation closed password/ESC/no-active-Faculty/roster/section/year/catalog-subject recovery, returning intake and history, email validation, print-page and student archive/restore browser gaps. Same-form revoke/restoration controls are absent and remain API-only coverage. Exhaustive combinations, protected mobile/cross-browser, physical printing and production behavior remain explicitly unclaimed. Review these scope limits at the Part 2 checkpoint before beginning Part 3.

## Latest checkpoint: mobile checks and Git backup

P2-16 responsive/accessibility corrections and browser retests completed at verified 390 × 844 and a desktop Enrollment recheck. See the final section of QA-TRACKER.md for the exact views and data states. Physical printing is deferred by the owner. Additional browser engines/devices and exhaustive populated/input/filter/download combinations remain unclaimed; selected school-year/subject controls still warrant a separate accessibility pass. The internal accounting app and Forms have not been tested in this stage.

Next: review Part 2 results and these limits, then begin the Part 3 checklist above when authorized. Keep PR #41 open; pushing this checkpoint does not authorize merging. Apply migration 0018 before deploying the new auth source. Do not run a regular build/migration against the remote database as part of QA.

Code checkpoint `a1302521` is committed and pushed. The working tree was clean after that push; this documentation records its completion. PR #41 remains open and unmerged.

Deferred accessibility fixes, client policy questions and verification gaps are collected in [ENROLLMENT-FUTURE-FOLLOWUPS.md](ENROLLMENT-FUTURE-FOLLOWUPS.md). The owner requested excluding docs/ from the production mirror; prod-sync.yml now filters that folder from its runner checkout before export.


## Latest checkpoint: Part 3 — 2026-10-03

The owner authorized Part 3 after reviewing the Part 2 scope limits. This supersedes the older instructions above to stop before accounting. Core supported accounting workflow walkthrough is now complete; see [QA-PART3.md](QA-PART3.md) for the step checklist, fixes, validation and retained local fixtures. Future checks and policy clarifications are in [ACCOUNTING-FUTURE-FOLLOWUPS.md](ACCOUNTING-FUTURE-FOLLOWUPS.md). Forms and physical printing remain deferred.

Accounting dev server is running on 3102 against retained local QA only. QA Resume Registrar is restored to Registrar, and its old Accounting session is revoked. Admin can review Accounting. Four payroll employee fixtures, completed first period, draft second period, paid loan and reconciled receipt/ledger fixtures are retained. No production data touched. The owner authorized committing and pushing the tested source/docs checkpoint; next is verify GitHub CI and review the final diff before merge. PR #41 remains open; no merge or deployment is authorized.
