# Staged website walkthrough checklist

Updated 2026-10-03. Branch: `codex/forms-and-fixes`. Tested current local development website at `http://localhost:3001`.

This tracker records browser walkthrough results. [FIX-TRACKER.md](FIX-TRACKER.md) records implementation and deployment work. A completed check means it was performed; the result column identifies failures and limitations.

## Stage checkpoints

- [x] Part 1: public website walkthrough completed; findings remain open below. Stop here for review.
- [x] Part 1: fix requested UI/accessibility findings and retest affected steps. Fee content remains unchanged and is deferred for client discussion; missing-route HTTP status review is separate.
- [ ] Part 2: core enrollment/account walkthrough and confirmed fixes tested; remaining browser/manual coverage must be completed or explicitly deferred before final review. See [QA-NEXT-SESSION.md](QA-NEXT-SESSION.md).
- [ ] Part 3: full accounting workflow. Start after the Part 2 checkpoint. Accounting Forms remain deferred until the owner supplies the documents.

The owner authorized using the existing admin account to create necessary test staff accounts during Part 2 and using registrar to create test students. No accounts were created during Part 1.

## Part 1 steps and results

Desktop viewport: 1440 x 900. Mobile viewport: 390 x 844. Accessibility-based browser interaction was used, without Playwright. Temporary viewport overrides were reset at completion, and the existing authenticated session was preserved.

| Done | Step | Expected | Actual / result |
| --- | --- | --- | --- |
| [x] | 1. Inventory public pages | Cover main website and news details | 19 main pages plus seven published news articles: 26 routes. PASS. |
| [x] | 2. Open every route on desktop | Page content, heading and representative media load | All 26 loaded. PASS for loading; content/accessibility findings below. |
| [x] | 3. Open every route on mobile | Readable content within narrow viewport | All 26 loaded; homepage title clips. FAIL P1-02. This was viewport emulation, not a physical phone. |
| [x] | 4. Check rendered local links and assets | Successful responses for referenced local targets | 26 page requests and 100 additional distinct targets returned HTTP 200. PASS for availability. Popup-only media and external services are outside this HTTP target count. |
| [x] | 5. Desktop navigation menus | About, Admissions and Campus Life expand and navigate | All three menus opened; representative links navigated to Vision & Mission, Basic Education and News & Events. PASS. Other listed destinations were covered by the route inventory. |
| [x] | 6. Mobile navigation | Open/close, expand a group, navigate and dismiss drawer | Open/close and About expansion work; selecting Vision & Mission changes the URL but leaves the drawer covering the page. FAIL P1-01. |
| [x] | 7. Homepage FAQs | Every question reveals its answer | All four questions opened and displayed the appropriate answer. PASS. |
| [x] | 8. Back to top | Return from lower homepage sections to hero | Keyboard activation returned to the homepage hero. PASS; the button has no accessible name (P1-05). |
| [x] | 9. Core-value popups | All five values show matching descriptions and close | Mindful, Prayerful, Passionate, Solidarity and Inclusivity opened with matching text; close worked. PASS for operation; close naming is P1-05. |
| [x] | 10. Hymn control | Play/pause responds and media asset is available | Play/pause icon/state responded; audio asset returned 200. PASS for control/media availability. Audible output was not verified. P1-05 covers its missing name. |
| [x] | 11. Registrar downloads | Three linked PDF resources are available | Enrollment Form, ESC Application Form and ESC Grantee Contract returned application/pdf with PDF headers. PASS for resource availability. Internal PDF contents and printing were not audited. Two files have whitespace before the PDF header; this is not treated as a missing/corrupt asset. |
| [x] | 12. Registrar address copy | Control responds and copies the address | UI displayed “Copied!”. Browser clipboard read did not provide usable confirmation. PARTIAL: clipboard contents remain unverified. See additional observation below. |
| [x] | 13. Public fee filters | Fee/grade selections work together and reset | Registration Fee + Kinder 1 showed only the matching entry; resetting both restored the list. PASS for representative combined filtering. Fee totals require confirmation (P1-06). |
| [x] | 14. News navigation | Article links open details and return to listing | All seven actual article URLs loaded; listing-to-Brigada and article-to-listing links worked. PASS. The raw source date-prefixed paths are normalized by the cards and are not visitor-facing broken links. |
| [x] | 15. Organization popup | Card opens profile, media loads and dialog closes | Campus Ministry opened with matching text/image; Escape dismissed it. PASS for pointer interaction; trigger lacks keyboard semantics (P1-04). Other organization dialogs were not individually exercised. |
| [x] | 16. Facility gallery | Open gallery, advance/return images, dismiss | Library gallery opened on mobile; next advanced 1/7 to 2/7 and loaded a different image; previous returned 1/7; Escape dismissed it. PASS for representative gallery operation. P1-04 covers card/thumbnail keyboard access. Other galleries and every thumbnail were not individually exercised. |
| [x] | 17. Contact required/invalid inputs | Prevent empty/invalid submissions and explain errors | Empty fields and malformed email were blocked. Formatted phone produced a digits-only validation error. PASS for rejection; UI format contradicts validator (P1-03). |
| [x] | 18. Contact valid submission | Save once and reset form | One synthetic contact record was saved; form returned to empty fields. PASS. Test record details below. No additional valid submissions were sent. |
| [x] | 19. Phone/email call-to-actions | Correct tel/mailto destinations | Destination links inspected. PASS for link configuration; no phone call or outbound email was made. |
| [x] | 20. Unknown page/article handling | Helpful recovery screen and working return links | Unknown root route showed Page Not Found with Go Back Home; unknown article showed News Not Found with Back to News. Return links worked. HTTP responses were 200 in local development; investigate status handling as P1-07. |
| [x] | 21. Final browser checks and cleanup | No newly observed console error; restore viewport | Final error log query returned no entries; viewport restored. PASS for this check, not a guarantee against every possible console error. |

## Part 1 page coverage

“Loaded” means the page was opened and its accessible content and representative viewport were inspected. It does not mean every pixel, item or possible interaction passed. P1-01 applies across public destinations reached through the mobile drawer, and P1-05 includes shared navigation/back-to-top controls.

| Route | HTTP | Desktop | Mobile | Notes |
| --- | --- | --- | --- | --- |
| `/` | 200 | Loaded | Loaded | P1-02: mobile title clips |
| `/accounting` | 200 | Loaded | Loaded | P1-06: four fee total discrepancies |
| `/accreditation-achievements` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/administration-faculty` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/alumni-testimonials` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/basic-education` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/board-of-trustees` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/contact` | 200 | Loaded | Loaded | P1-03: phone format mismatch |
| `/elementary` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/facilities` | 200 | Loaded | Loaded | P1-04: pointer-only card/thumbnail triggers |
| `/history-hymn-logo` | 200 | Loaded | Loaded | P1-05: unnamed audio control |
| `/junior-high` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/news-events` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/news-events/brigada-eskwela-2026` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/news-events/enroll-now-2026` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/news-events/faculty-staff-retreat-2026` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/news-events/foundation-anniversary` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/news-events/getting-ready-2026` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/news-events/groundbreaking-2026` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/news-events/website-2026` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/organizations` | 200 | Loaded | Loaded | P1-04: pointer-only card triggers |
| `/registrar` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/scholarship` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/school-calendar` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/senior-high` | 200 | Loaded | Loaded | No page-specific failure observed |
| `/vision-mission` | 200 | Loaded | Loaded | P1-05: unnamed popup close control |

## Part 1 findings and retest checklist

### P1-01 — Mobile drawer remains open after navigation (P2)

- [x] Fix drawer closing when a route is selected/changes; same-page selections also close it.
- [x] Retest About (Vision & Mission), Admissions (Registrar), Campus Life (Organizations), Contact and Portal destinations at 390 pixels. Portal reached the existing admin dashboard without changing accounts.

Reproduction: open the mobile menu, expand About, select Vision & Mission. The URL and underlying content change, but the drawer still covers the destination until manually closed. `apps/website/src/components/scaffolding/Navigation.tsx` resets drawer state only on initial mount; ordinary mobile destination links do not close it.

### P1-02 — Mobile homepage school title clips (P2)

- [x] Allow the school title to wrap within the viewport; use a wider desktop content container.
- [x] Retest 320, 390 and 430 pixels, then 1440-pixel desktop. The title fits; the desktop two-line layout is preserved.

At 390 pixels, the “PAROCHIAL SCHOOL, INC.” line extends beyond the available width. `apps/website/src/sections/home/HeroSection.tsx` uses `whitespace-nowrap` for the line. Saved screenshot: `mobile-home.jpg` in the evidence folder below.

### P1-03 — Contact phone example conflicts with validation (P2)

- [x] Make the placeholder/help text and accepted phone formats consistent: owner chose the Philippine mobile pattern `09XXXXXXXXX`. Existing digits-only validation is retained; X represents a digit to enter.
- [ ] Retest formatted and digits-only phone inputs, optional blank phone, and successful save.

The UI suggests `(042) 731-XXXX` in `apps/website/src/sections/contact/ContactSection.tsx`, but entering `042-731-9482` is rejected with “Phone number can only contain digits. Do not include spaces, dashes, or letters.” Required fields and invalid-email checks work.

### P1-04 — Organization/facility cards and gallery thumbnails lack keyboard access (P2)

- [x] Add named native card buttons and convert gallery thumbnails to named native buttons with selected-state feedback, preserving layout.
- [x] Retest Tab focus, Enter/Space opening, thumbnail selection, next-image navigation, Escape dismissal and focus restoration to the originating card.

`OrganizationsSection.tsx` and `FacilitiesSection.tsx` use clickable divs without button roles, tab stops or keyboard handlers. Their cards appear as content in the accessibility tree even though pointer activation opens dialogs. Gallery thumbnails have the same pattern. Pointer operation was confirmed; keyboard support is absent in the source.

### P1-05 — Several icon-only controls have no accessible name (P2)

- [x] Name mobile menu open/close, hymn play/pause, core-value close and back-to-top controls. Replace the pointer-only hymn seek bar with a named native range input.
- [x] Retest accessible names and keyboard operation. Mobile groups expose expanded state; collapsed links are absent from the accessibility tree and skipped by Tab. Mobile/core-value dialogs trap focus, support Escape, and restore focus on dismissal.

The browser accessibility tree exposes these controls simply as “button”. Users of assistive technology cannot identify their purpose. Facility and organization dialog close buttons already expose “Close”; those do not need the same naming fix.

### P1-06 — Four public fee totals disagree with the listed items (deferred for client discussion)

Owner instruction: leave all public fee amounts unchanged. Temporary client discussion note: `tmp/CLIENT-DISCUSSION-PUBLIC-FEES.md`. This concern does not block the UI fixes or subsequent walkthrough stages.

- [ ] Confirm the intended fee values/totals against the school's approved schedule.
- [ ] Correct approved discrepancies and verify each grade total.

These are static public fees in `apps/website/src/sections/admission/accounting.ts`, separate from internal accounting contracts. No financial amount was changed. Listed amounts sum as follows, including every non-dash item:

| Grade | Published total | Sum of listed items | Sum minus total |
| --- | ---: | ---: | ---: |
| Grade 4G | 28,105.00 | 27,755.00 | -350.00 |
| Grade 6 | 35,970.00 | 36,320.00 | +350.00 |
| Grade 9 | 33,020.00 | 40,820.00 | +7,800.00 |
| Grade 10 | 40,425.00 | 32,625.00 | -7,800.00 |

This proves the displayed arithmetic is inconsistent; it does not establish whether an item, total or inclusion rule is wrong. If some items are optional/excluded, explain that rule on the page.

### P1-07 — Missing routes return HTTP 200 locally (P3, verify deployment behavior)

- [ ] Review missing-page/article handling and verify HTTP status in a suitable production-like environment.
- [ ] Retest helpful recovery screens and links after any change.

GET `/qa-missing-page` and `/news-events/qa-missing-article` both returned 200 while the browser displayed their not-found screens. Development streaming/client rendering can affect status behavior; no production-build conclusion is made from this result.

Additional observation: registrar copy feedback is set without awaiting/catching `navigator.clipboard.writeText`. Consider displaying success only after the clipboard promise resolves. Clipboard failure was not conclusively reproduced, so this is a robustness observation rather than a confirmed broken copy function.

## Test data, evidence and limits

One retained QA contact record:

- Name: `QA Public Sweep 2026-10-02`
- Email: `qa-public-sweep-20261002@example.invalid`
- Subject: `QA Part 1 contact test`
- Message: `Synthetic website walkthrough test. No response needed.`
- Phone: blank, since optional.

A read-only database count confirmed exactly one record matching its email/subject. This uses the currently configured app database; it has not been established as disposable. No existing school-year, staff, student, contract, payroll, loan or receipt record was changed. No outbound email was sent by the contact action.

Local screenshot evidence folder: `C:/Users/Alfred/.codex/visualizations/2026/10/02/01a0fbdd-d342-7860-8fb3-082800ee2363/qa-part1/`.

- `mobile-home.jpg`: clipped school title.
- `mobile-menu-after-navigation.jpg`: drawer covering Vision & Mission after navigation.
- `mobile-vision-mission.jpg`: content after manually closing drawer.
- `contact-form-desktop.jpg`: empty contact fields and the formatted phone placeholder.

The local HTTP audit report is in ignored `tmp/public-sweep-results.json`; it is supporting data rather than a committed artifact. No application code was changed during the initial Part 1 walkthrough. The subsequent owner-authorized UI fixes and retests are recorded below. This was one browser engine on local development servers, with representative control tests. Cross-browser/physical-device testing, PDF content/printing, exhaustive galleries/filter combinations, audible media, external phone/email handlers and production performance remain outside this completed pass. Portal authentication and protected workflows belong to Part 2.

## Part 1 requested fixes — browser retest results

Completed 2026-10-02 after the owner requested fixes. These results supersede the affected initial failures above; the original walkthrough table remains the record of what was first observed.

| Done | Retest | Result |
| --- | --- | --- |
| [x] | Mobile drawer selection: About, Admissions and Campus Life | PASS: destination URL/content changed and the drawer closed. |
| [x] | Contact link and same-page Contact selection | PASS: drawer closed in both cases. |
| [x] | Portal entry | PASS: drawer closed and the existing authenticated session routed to `/dashboard/admin`; no account data was edited. |
| [x] | Mobile collapsed-group Tab order | PASS: Close -> About -> Admissions; hidden About links were skipped. Group controls expose expanded/collapsed state. |
| [x] | Mobile Escape and focus restoration | PASS: Escape closed the drawer and returned focus to Open navigation menu. |
| [x] | Homepage title at 320, 390 and 430 pixels | PASS: complete title fits and wraps. |
| [x] | Homepage at 1440 pixels and desktop About navigation | PASS: two-line title remains readable; About opened and its History/Hymn link navigated correctly. |
| [x] | Additional 320-pixel horizontal overflow | PASS after wrapping the long FAQ contact button; footer email can wrap and the small-screen brand text fits. No horizontal scrollbar appeared in the final homepage screenshot. |
| [x] | Organization card keyboard access | PASS: Space opened Campus Ministry; Tab reached Filipino Club and Enter opened it. Escape restored focus to the originating card. |
| [x] | Organization dialog focus | PASS: Tab remained on the dialog's only actionable Close control. |
| [x] | Facility card and gallery thumbnail keyboard access | PASS: Enter opened Library; Space on image 3 selected 3/7; Enter on Next advanced to 4/7; Escape returned focus to View Library gallery. Thumbnail controls expose names and selected state. |
| [x] | Core-value dialog | PASS: Enter opened Mindful; named Close received focus; Tab stayed in the dialog; Escape restored focus to Mindful. The shared dialog now handles scroll lock and focus instead of a custom backdrop. |
| [x] | Named hymn play/pause | PASS: Space changed Play school hymn to Pause school hymn; Enter paused it and restored the Play name. Audible output was not assessed. |
| [x] | Hymn seek keyboard input | PASS: Right arrow changed the named playback slider from 0 to 1. |
| [x] | Named Back to top | PASS: Enter returned to the top of History/Hymn/Logo; the hidden control is excluded from Tab order. |
| [x] | Contact placeholder follow-up | PASS: owner-requested `09XXXXXXXXX` appears on the contact form. Digits-only validation remains unchanged. |
| [x] | Code checks | PASS: website `tsc --noEmit`, targeted Biome checks for changed components, and `git diff --check`. No build/database migrations were run for these UI changes. |

New screenshot evidence in the same local folder: `mobile-home-fixed-320.jpg`, `mobile-home-fixed-390.jpg`, `mobile-menu-navigation-fixed.jpg`, `gallery-keyboard-fixed.jpg`, and `contact-phone-ph-mobile.jpg`.

Public fee amounts remain unchanged, with the client discussion note retained at `tmp/CLIENT-DISCUSSION-PUBLIC-FEES.md`. Missing-route status handling (P1-07) and registrar clipboard confirmation remain separate observations. Parts 2 and 3 have not started. No new QA contact submission was made during these retests.

## Part 2 — enrollment walkthrough in dependency order

Status: review checkpoint reached on 2026-10-02 against an owner-approved isolated local PostgreSQL database. Confirmed fixes are included in the owner-requested commit/push checkpoint. Part 2 remains incomplete; next session finishes its remaining coverage before Part 3.

### Terms and actual dependencies

| Term | Meaning in this repository | Dependencies |
| --- | --- | --- |
| School year | Academic-year record and active-year selection | Registrar intake requires a selected year (active is the default); department queues require an active year. |
| Teacher | A user with role `staff` and department `faculty` | Created by Registrar -> Teachers, or through appropriate admin account setup; not a separate user role. |
| Subject | Entry in the shared subject catalog | Name required; code/description optional. It can be created before a school year or section. |
| Section | Grade-level student group for one school year | Name, grade level and school year required. Adviser and room are optional; subjects/teachers are not required to create an empty section. |
| Class schedule / subject assignment | Subject linked to a section, optionally with a teacher and lesson time | Existing section + existing subject required. Teacher, weekday and start/end time are optional in the current action/UI; populate them for the complete walkthrough. |
| Enrollment form | One student's enrollment for one school year | Student identity/profile + school year + enrollment details. New-student intake creates the student login account as well. One form per student/year is allowed. |
| Clearance | Clinic, Guidance and Accounting completion flags | New form enters Clinic; Guidance pending queue requires Clinic done; Accounting pending queue requires Guidance done. |
| Final enrollment | Registrar marks `isEnrolled = true` | UI requires all three clearance flags; server enforcement must also be checked, as noted below. |
| Section roster | Membership linking an enrollment form to a section | Final enrollment must be complete; section grade and year must match; a duplicate assignment is rejected. |
| Advisory grades | Grades/general average saved by a section adviser or admin | Existing section + roster; subject grades require a subject assigned to that section. Setting a teacher only on a subject is not sufficient to grant section-adviser grade access. |

Setup flow: **school year + teachers + subject catalog -> section/adviser -> class schedule**.

Student flow: **Registrar (or authorized faculty-assisted) intake/account creation -> Clinic -> Guidance -> Accounting -> Registrar final enrollment -> section roster -> adviser grade workflow**.

These two flows join at section assignment. Intake itself does not require a section or timetable, but the planned walkthrough prepares them first so the final enrollment can be tested through roster and grades without interruption.

### Part 2 execution log

Baseline: `ef8d19b2`, copied into ignored `tmp/qa-runtime`. Website `http://127.0.0.1:3101`; accounting `http://127.0.0.1:3102`. Disposable PostgreSQL 18 cluster on loopback port 55442, with a local WebSocket bridge on 55443 and the real Neon driver. Repository migrations applied; only a synthetic admin seeded. Runtime-only database transport/root configuration is confined to the ignored copy. No remote database content or credentials were copied. Current app environments on 3001/3002 remain unchanged.

The owner explicitly selected an isolated QA database and clarified that Admin is a distinct role/view, while Staff uses the assigned department view (Guidance, Clinic, Registrar, Accounting or Faculty). A second Admin is supported through the Administrator option. Results exercise application queries/transactions, not Neon cloud latency, suspension or production deployment behavior. Passwords are excluded from this tracker.

| Step | Account / fixture | Expected | Actual / result |
| --- | --- | --- | --- |
| Environment isolation | QA runtime | Separate database and app processes | PASS: fresh local cluster, migrated schema, synthetic admin only; separate 3101/3102 instances. |
| Current environment baseline (read-only) | Existing admin | Establish active-year state without mutation | PASS: two existing school years, both inactive. No current records changed. |
| Empty login | Signed out, QA website | Required field blocks submission | PASS: browser required-email validation. |
| Wrong password | Synthetic QA admin | Reject sign-in | PASS: Invalid email or password. |
| Valid admin login | Synthetic QA admin | Admin landing and user management | PASS: admin dashboard and account directory loaded. |
| Staff creation | Admin -> four department accounts | User/profile created with selected role/department | PASS: QA Registrar, Clinic, Guidance and Accounting appear in directory. |
| Administrator option | Admin -> second QA admin | Correct privilege mapping | PASS: Administrator creates role admin plus admin-department profile; it does not create a staff/admin account. |
| Duplicate email | Admin -> existing QA registrar email | Reject duplicate, no extra account | PASS: Email already in use; dialog cancelled. |
| QA layout setup | Ignored QA copy | Same generated styles as current app | Initial setup failure: Tailwind skipped app classes in nested ignored tmp. RESOLVED in runtime only with explicit source root, source registration and fresh cache; screenshot confirms restored layout. Functional checks above remain valid; no visual pass claimed before correction. |
| Legacy department fixtures | Utility and staff/admin combinations | Clarify current scope | EXCLUDED after owner clarification. Auto-review rejected proposed direct inserts; nothing was executed. Supported Administrator option already passed. |



Additional execution results:

| Step | Account / fixture | Expected | Actual / result |
| --- | --- | --- | --- |
| Registrar login/logout and protected routing | QA Registrar; signed out | Correct department and denial when signed out | PASS: registrar view; admin-users URL while signed out redirected home. |
| No active year | Registrar wizard | Explain missing enrollment prerequisite | PASS: No active school year shown; wizard cancelled without creating records. |
| School-year create/activate | Year 1, QA 2026-2027 | Persist valid dates, activate, prevent active-year archival | PASS: 2026-10-01 to 2027-09-30 persisted; Active shown; archive disabled. |
| Teacher creation | Users 7/8, staff 6/7 | Registrar creates faculty logins and profiles | PASS: QA Adviser and QA OtherTeacher saved; read-only DB verification confirms staff/faculty. |
| Subject create/edit | Subjects 1/2 | Optional fields and edited persistence | PASS: Mathematics with code/description; English saved with blanks, then edited to QA-ENG and description. |
| Subject archive | QA English 2 | Recoverable archive | PASS: archive confirmed in database/UI; owner accepted native restore prompt and read-only DB verification confirms restored. Browser confirmation automation limitation required owner help. |
| Empty section | Section 1, Grade 1, year 1 | Allow no adviser/room/subjects | PASS: saved with zero students and Unassigned adviser. |
| Section edit | Section 1 | Adviser/room persist | PASS: QA Adviser and QA Room 101 displayed after save. |
| Subject schedule | Section 1, subject 1, staff 7 | Subject/teacher/day/time save | PASS for save: QA Mathematics, QA OtherTeacher, Monday 08:00–09:00; saved toast. PASS: later section detail navigation displays saved teacher and Monday 08:00–09:00. |
| Missing bio-data | Registrar new-student wizard | Reject empty required fields | PASS: Please fill in all required fields; remained on Bio-data. |
| New elementary intake | QA Elementary, LRN 990000000001 | Create account/profile/pending form and credentials | PASS: generated credentials displayed; pending count 1, Grade 1, assisted by QA Registrar. |
| Pending final-approval UI | QA Elementary | No finalize before clearances | PASS: tracking shows Clinic current; no final-approval action. Server enforcement remains separate. |
| Student generated login and profile | QA Elementary | Working generated account and own profile | PASS: login succeeded; pending journey and locked academic portal shown; own profile values displayed read-only. |
| Student protected routing | QA Elementary | Deny staff/admin/internal accounting views | PASS: admin and registrar URLs redirected home; internal accounting displayed Unauthorized, accounting personnel only; grades redirected to student dashboard as currently designed. |
| Department sequencing before clearance | QA Guidance / QA Accounting | Hide student until preceding clearance | PASS: Guidance queue empty before Clinic; Accounting queue empty before Guidance. Guidance direct Clinic URL returned own department view. |
| Clinic queue and approval | QA Clinic / QA Elementary | Student visible; approval moves to history | PASS: Pending 1 became Pending 0 / History 1; history shows QA Clinic and approval timestamp. |
| Clinic saved history | QA Elementary | Persist synthetic remarks | PASS: View Answers displays saved synthetic notes. OBSERVATION: submitting without explicitly selecting answers is accepted and history renders all questions as NO, including female-only questions for a male student. Validation/representation requires review before calling questionnaire coverage complete. |

Further execution after resume:

| Step | Fixture | Result |
| --- | --- | --- |
| Guidance after Clinic | Form 1 | PASS: appeared after Clinic; approved by QA Guidance; history count 1, birthplace QA Mauban and same-address selection persisted in read-only record. |
| Accounting after Guidance | Form 1 | PASS: appeared after Guidance; Down Payment saved with QA-SI-0001 and synthetic notes; record and approver attribution verified. |
| Accounting edit variants | Form 1 | PASS: edited Down Payment -> Promissory Note -> Full Payment; promissory notes persisted. All remain financially cleared. These are status-record tests, no money or binding commitment. |
| Insufficient payment UI | Accounting create/edit | NOT AVAILABLE: both selectors expose only Full Payment, Down Payment and Promissory Note. API-only insufficient behavior requires regression coverage; no browser pass claimed. |
| Final Registrar approval | Form 1 | PASS: all three departmental attributions/notes displayed; owner accepted native final confirmation; DB confirms isEnrolled true and UI Pending 0 / Enrolled 1. |
| Registrar section assignment | Form 1 -> Section 1 | PASS: matching QA Grade 1 A selected, success toast, enrolled row displays assigned section and disables duplicate UI assignment. |
| Dashboard pending count | Form 1 before final approval | OBSERVATION: dashboard Pending Forms showed 0 while Enrollment All Pending showed 1 after all clearances. Check aggregate definition before calling dashboard consistent. |

Confirmed accessibility finding P2-01: section adviser and subject teacher picker triggers are clickable divs, absent as actionable controls in the accessibility tree. Pointer selection worked. Converted all three affected triggers to native named buttons; targeted Biome and website type checks passed. PASS browser retest: Enter and Space open the named adviser trigger; Space opens Edit Subject teacher and Enter opens Add Subject teacher. Expanded state appears in the accessibility tree.

### Resumed regression checks and fixes

- [x] P2-01: adviser/Add Subject/Edit Subject picker triggers now native named buttons; keyboard opening verified in the browser.
- [x] P2-02: reproduced Guidance-before-Clinic, Accounting-before-Guidance, final approval and re-enrollment without clearances against disposable PostgreSQL. Added prerequisites to the SQL UPDATE predicates; rejected requests leave flags unchanged. Missing/archived final-approval forms also reject.
- [x] P2-03: Pending Forms card read a field never returned by the API. Added an actual pending-form count, including Guidance and final-approval stages. Database regression passes; browser retest shows Total 2, Pending Forms 1, Pending Clinic 1 and Enrolled 1 with QA Nursery pending.
- [x] Real PostgreSQL regression suite: 26 tests pass after transaction-lock, existing-profile persistence and archived-student pending-queue fixes. Covers intake rollback, duplicate email/LRN/year rejection, representative classifications, existing-student guardian fields at the action level, department sequence, payment variants, final approval, archived final form, section checks, grade batch rollback and adviser/roster/subject validation.
- [x] Grade browser save/reload: Math 95.00, English 90.00, calculated average 92.50. Clearing English produced 95.00 average; restored English 90 for retained fixtures. Saved rows confirmed read-only in QA database.
- [x] Optional subject assignment: QA English assigned to Section 1 with blank teacher/day/time; UI displays No teacher assigned / Unscheduled.
- [x] P2-05: browser reproduced existing-student review/save mismatch (profile edits discarded and new-year guardian fields blank). Wizard now sends reviewed profile and guardian fields; intake updates the profile and inserts the form atomically. Returning Nursery browser retest persists first name QA Returned, QA Returned Address, QA Returned Guardian and 09000000004 after reload. Duplicate-failure regression preserves the previously saved profile.

Regression cluster uses port 55444, is initialized/migrated for each opt-in run and stopped afterward. It is separate from the retained browser QA database on 55442. Fixtures cannot log in and use only supported roles; session infrastructure alone is mocked, with real authorization guards/actions/SQL. Command: `RUN_ENROLLMENT_INTEGRATION=1 pnpm exec vitest run packages/db/test/enrollment-workflow.integration.test.ts --exclude 'tmp/**'` after loading NVM. Native confirmation difficulty is a browser-tool limitation, not a failed restore/final-enrollment feature.

### Faculty browser checks

- [x] QA Adviser sees Section 1 under Advisory Grades and its enrolled roster/Math/English subjects.
- [x] Browser grade save and clearing confirmed; retained Math 95, English 90 and average 92.50.
- [x] Faculty-assisted QA Nursery intake succeeds with no LRN, DOB 2022-10-02, female, legal guardian and grade Nursery (learner type elementary).
- [x] Faculty pending list attributes QA Nursery to QA Adviser; tracking contains no final approval or drop/transfer controls.
- [x] Website and accounting `tsc --noEmit` pass; unit run excluding `tmp/**` passes 40 files / 222 tests. First unit run was stopped when it also discovered ignored runtime copies; do not count its duplicated results.

### Later account/year checks

- [x] Non-adviser QA OtherTeacher cannot open Section 1 advisory grades: direct URL redirects to own empty advisory list despite subject-teacher assignment.
- [x] QA Elementary generated login shows Enrollment Verified after final approval; profile fields remain correct.
- [x] Faculty-created QA Nursery generated login succeeds and shows Clinic processing / Academic Portal Locked.
- [x] Year 2 QA 2027-2028 created with 2027-10-01 to 2028-09-30. Full rollover from year 1 creates Section 2 with existing adviser and two subjects, zero roster entries. Original Section 1 retains its student.
- [x] Activate year 2 switches year 1 inactive; enrollment list defaults to year 2 with zero forms.
- [x] P2-04: delayed-insert real PostgreSQL test reproduced two simultaneous forms for the same student/year. Intake now locks the student within the creation transaction before duplicate checking. The strengthened race test passes; no schema migration needed.
- [x] Student data isolation regression: own dashboard works; another user’s dashboard/history is denied.

### Latest intake and status checks

| Step | Fixture | Result |
| --- | --- | --- |
| Existing old-student intake | Student 1, form 3, year 2 | FAIL before P2-05: review showed QA Updated and revised address/guardian; profile stayed unchanged and guardian fields were null. Preserved as pre-fix evidence. |
| Returning / Balik-Aral intake | Student 2, form 4, year 2 | PASS after P2-05: reused existing account/profile, Kindergarten 1 and returning classification, previous Nursery/year/school history; edited name/address and new-year guardian persisted in DB and profile dialog after reload. |
| Junior-high transferee intake | Student 3, form 5, year 2 | PASS: generated credentials, Grade 7, transferee, previous Grade 6/year/school and ESC true persisted. |
| Senior-high Academic | Student 4, form 6, year 2 | PASS: Grade 11, Academic track, voucher true; missing SHS track blocked Next with an explanatory message. Saved track shown after reload. |
| Senior-high TechPro | Student 5, form 7, year 2 | PASS: Grade 12, TechPro track, voucher false; saved track shown after reload. |
| Dropped enrollment | Form 5 | PASS: custom synthetic reason saved; pending 5 -> 4 and Dropped / Transferred 0 -> 1; dropped history contains reason and timestamp. No recovery control is exposed in the dropped list; re-enrollment action enforcement is covered separately by the integration suite. |
| Latest validation | Original repository | PASS: website type check; 40 unit files / 222 tests excluding temporary runtime. Latest real PostgreSQL integration suite: 26 passing tests. Both website and accounting type checks pass. Targeted Biome has no errors; 16 existing non-null assertion warnings remain in query files. Diff check passes. |
| Student archive | QA TechPro student 5 | PASS: directory Active 5 -> 4 / Archived 0 -> 1; synthetic login rejected as deactivated. FAIL before P2-06: Clinic still listed the archived student. Fixed and browser retest shows Pending 4 -> 3 without TechPro. Restore confirmed by owner; generated login works again. |

Returning-student proof: `returning-student-persistence.png` in the Part 2 evidence directory. All passwords remain private to the QA browser session. Students 3–5 and forms 5–7 are synthetic, retained only in the disposable local QA database. Part 3 has not started.

### Latest queue, history and account checks

- [x] P2-06: archived student remained in Clinic clearance queue. Clinic, Guidance, Accounting and Registrar pending queries/counts now exclude archived student/login records; dashboard counts agree. Real archive/restore regressions pass at each of the three clearance stages, including profile and login archival flags and restored pending work. Clinic browser retest excludes archived TechPro.
- [x] Repeated full rollover from year 1 to year 2 reports zero sections created; DB still contains only the original and copied section.
- [x] Historical year filter shows year 1 pending Nursery and enrolled Elementary; historical registrar note edit persists in the list.
- [x] Corrected earlier source notes: registrar intake targets the selected school year, defaulting to active. Historical filter opens a wizard labelled QA 2026-2027; cancelled without creating a form. Department queues still use the active year.
- [x] New synthetic local contact message reaches Registrar Messages, search finds it and View displays full message/phone. The Part 1 message remains in the original environment and was not copied. Local QA PostgreSQL defaults to Asia/Manila; timestamp display parity with the remote database is not established by this run.
- [x] Second Administrator login shows System Administration and Admin navigation; Registrar student directory, Guidance and website Accounting pages load with ADMIN context. Clinic admin route was not conclusively observed during the rapid navigation check.
- [x] Clinic direct admin-users URL denied (redirected home).
- [x] Browser TechPro restore/login retest: owner accepted native confirmation; directory returns to Active 5 / Archived 0. Generated credentials sign in successfully; pending journey and saved profile/guardian values verified. Clinic queue reappearance verified after restore.
- [ ] Internal accounting Admin access check: automatic approval review rejected port 3102 access as crossing the Part 2 checkpoint. Defer to Part 3; no workaround attempted.

### Continued Clinic, Guidance and Accounting retests

- [x] P2-07: Clinic Yes/No and remarks fields now have question-specific accessible names. Keyboard No selection, edited remarks/notes, save and reload verified on Academic form 6.
- [x] P2-08: Clinic print incorrectly displayed the approving staff name under Student Signature. Corrected to the student full name; preview now displays QA Academic. Evidence: `clinic-print-fixed.png`.
- [x] Guidance form 6: Clinic completion placed Academic in the active-year queue. Profile birthplace/birth order/contact and same-address persisted; Other assessment text persisted. History edit saved revised birthplace and notes. Print preview shows revised birthplace and selected assessment text. Evidence: `guidance-print-persistence.png`. Native physical printing was not performed.
- [x] Website Accounting form 6: Guidance completion placed Academic in payment queue. Synthetic Full Payment with QA-SI-0006 and explicitly test-only notes saved; queue emptied and history View Records displays matching values. No money collected or internal accounting transaction created.
- [x] Latest website type check and 40 unit files / 222 tests pass after Clinic UI/print fixes. Earlier 26 isolated PostgreSQL workflow regressions remain passing.

### Progress snapshot — latest continuation

- [x] P2-09: dropped/transferred student dashboards no longer show an active processing journey. API returns the recorded status; browser confirms Enrollment Dropped (student 3) and Enrollment Transferred (student 5). Real-action regressions cover both.
- [x] P2-10: teacher edit and create/edit close controls have accessible names. Teacher middle-name edit persists; Enter opens Edit QA OtherTeacher and Space closes the named editor.
- [x] P2-11: Class Builder displayed the active year but its refresh fetched all years. Request now uses the displayed year. Browser active-year view shows only section 2; historical selection shows only section 1 and its roster.
- [x] P2-12: reversed class times were accepted (08:00–07:00 saved in QA). Creation and locked partial edits now reject end <= start and invalid time formats. Browser invalid edit remains open; valid 08:00–09:00 saves. Regression reproduced failure before fix and passes after fix. Optional unscheduled times remain supported.
- [x] Academic lifecycle regressions: active-year archive rejects; inactive archive/restore and activation preserve exactly one active year. Optional section creation/archive/restore pass. Teacher profile/login archival/restoration pass. Archived matching rollover targets are skipped; same-year rollover rejects.
- [x] Lifecycle regressions: revoke/reapprove final enrollment, dropped-to-enrolled restoration, unassign/reassign and one active roster entry pass. These do not establish full browser coverage of their native confirmation controls.
- [x] Browser intake validation: malformed email, short LRN and short guardian contact each block progression with a visible message. Cancelled without creating a new account/profile/form.
- [x] Latest validation: 34 isolated PostgreSQL regressions, 40 unit files / 222 tests, website/accounting type checks and whitespace check pass after the latest schedule and year-filter fixes. Targeted Biome across 17 modified TypeScript files has no errors and 24 warnings.

Part 2 reached its review checkpoint after the final continuation below. Earlier test counts are chronological results; that session ended with 39 passing tests, extended to 41 in the 2026-10-03 continuation. The plan uses mixed browser, real-database regression and source review; remaining manual checks are explicitly separated below.

### Final continuation and review checkpoint

| Check | Method | Result |
| --- | --- | --- |
| Subject search by QA-ENG; student Grade 11 filtering | Browser | PASS: expected records shown. |
| Academic family edit | Browser save/reload plus student profile | PASS: QA Academic Father persists and is visible to the student; guardian remains QA Academic Guardian / 09000000006. |
| Academic student after all clearances | Browser | PASS: final approval Processing and academic portal locked until Registrar approves; no false enrolled state. |
| Elementary active vs historical year | Browser | PASS: active year 2 shows Clinic processing; `/dashboard/student?syId=1` shows Enrollment Verified for QA 2026-2027. No visible year selector is supplied by this dashboard. |
| Student settings | Browser read only | Change Password fields load. Credential entry/submission not tested; it requires owner handoff. |
| Supported Administrator -> Clinic | Browser | PASS: Clinic dashboard loads under ADMIN, alongside earlier Registrar/Guidance/website Accounting access checks. |
| No active year | Regression + source review | Registrar history remains readable; Clinic/Guidance/website Accounting queues empty. Faculty advisory page explicitly displays No active school year found (source-reviewed, not browser-tested without an active year). |
| ESC set/clear | Real action / disposable PostgreSQL | PASS: selected form updates; other-year form unchanged; unauthorized Clinic request rejects. ESC browser control remains untested. |
| Subject assignment lifecycle | Real action / disposable PostgreSQL | PASS: duplicate active assignment rejects; remove archives and restore clears archive flag. |
| Section boundaries | Real action / disposable PostgreSQL | PASS: pending, wrong grade, wrong year and duplicate assignment reject; unassign/reassign leaves one active roster entry. |
| Teacher duplicate email | Real action / disposable PostgreSQL | PASS: duplicate email rejects without leaving a partial staff profile. |
| Grade option mapping | Source review + representative browser intake | Nursery–Grade 6 elementary, Grades 7–10 junior high, Grades 11–12 senior high. Representative scenarios passed; every grade was not individually enrolled. |
| Final validation | Automated | 39 isolated PostgreSQL regressions PASS; existing final product checks remain 40 unit files / 222 tests, both app type checks, zero Biome errors across 17 modified TypeScript files (24 warnings), and whitespace check PASS. New regression file also passes Biome with no findings. |

Remaining checks and decisions are not failures or implied passes:

- [ ] Owner-operated password change/reset and the full account/department-change browser matrix; representative login/access plus existing guard/session regression coverage was performed.
- [ ] Native browser confirmations for every revoke/re-enroll, assignment removal and academic archive variant. Underlying actions were tested; representative subject/student restore and final approval confirmations were accepted by the owner.
- [ ] ESC-number browser editor and exhaustive search/filter, queue-history and invalid-ID combinations. Selected-form ESC/authorization and core missing/archived form rejection have regression coverage.
- [ ] Physical printing, exhaustive download variants, mobile protected-screen/cross-browser checks and production deployment behavior.
- [ ] Client policy: Accounting insufficient reversal, approval metadata, timetable overlaps, and Clinic unanswered/female-only answers. Notes retained in ignored `tmp/enrollment-client-concerns.md`; no policy invented.
- [ ] Product decision: student historical-year selector and expanded academic information (track, ESC/voucher). Data persists and own-record isolation is tested, but current student profile does not display every enrollment field.
- [ ] Additional icon-control naming observed in shared password visibility and some registrar dialog controls; current fixes address the confirmed P2-01/P2-07/P2-10 controls, not a comprehensive protected-screen accessibility audit.
- [ ] Finish remaining Part 2 coverage and review, then explicitly start Part 3. Tested fixes are saved in the owner-requested Git checkpoint; Forms remain excluded.

### Retained disposable fixtures and cleanup disposition

All records below exist only in the local QA cluster on 55442. Retain them for Part 3 and review; dispose of the isolated runtime/cluster after the staged sweep when no further evidence is needed. No client database cleanup is implied or performed.

| Records | Retained state / purpose |
| --- | --- |
| Users 1–8 | Two Admins; Registrar, Clinic, Guidance, Accounting; adviser and other faculty. All active. Preserve for Part 3 access checks. |
| Students 1–5 / users 9–13 | Elementary, Returned Nursery, Transferee, Academic, TechPro. All profiles/accounts active; dropped/transferred are enrollment statuses. Preserve classification/lifecycle evidence. |
| School years 1–2 | QA 2026-2027 inactive; QA 2027-2028 active. Preserve historical and current fixtures. |
| Subjects 1–2 / faculty staff 6–7 | Mathematics / English and two faculty teachers. English restored; OtherTeacher middle name QA Middle. |
| Sections 1–2 / schedules 1–4 | Original and rolled-over Grade 1 A; each has Mathematics Mon 08:00–09:00 and English unscheduled. Preserve setup/rollover evidence. |
| Forms 1–2, year 1 | Elementary enrolled/cleared with synthetic SI QA-SI-0001; Nursery pending. |
| Forms 3–7, year 2 | Old Elementary and returning Nursery pending; Transferee dropped; Academic cleared awaiting final approval (SI QA-SI-0006); TechPro transferred. Form 3 retains pre-fix missing guardian evidence. |
| Roster 1 / grades | Form 1 -> section 1; Math 95, English 90, average 92.50. Preserve adviser/persistence evidence. |
| Clinic/Guidance/Accounting clearances | Synthetic forms 1 and 6, attributed to actual QA departments; no payment collected. Preserve print/approval history. |
| Contact message | QA Local Visitor / qa-contact@example.invalid in local Registrar inbox. Preserve message search/view evidence. Original Part 1 contact remains in its original database. |
| Regression fixtures | Each run uses separate disposable cluster 55444 and stops it at completion. No regression fixture is a retained browser login account. |

### 2.0 — Test scope and prerequisites

- [x] Verify that the running website and internal accounting app use the intended test database. Record environment, branch/head and retained QA IDs; do not put passwords in this tracker.
- [x] Select the owner-approved school year and test-data scope before activation. The last read-only check found no active year; verify current state again rather than assuming it is unchanged.
- [x] Prefer an isolated database for repeated enrollment, grade clearing and lifecycle checks; otherwise use explicitly designated QA records and do not modify existing client/student records.
- [ ] Record the expected no-active-year behavior in registrar, clinic, guidance, accounting and faculty before resolving that prerequisite.
- [x] Define clearly marked synthetic subjects, teachers, sections and student identities. Record actual results/evidence per step, not just a final pass/fail.

### 2.1 — Account setup and access matrix

- [x] Use the existing admin to create necessary Registrar, Clinic, Guidance and Accounting QA staff accounts, as already authorized by the owner.
- [x] Use Registrar -> Teachers to create a QA faculty teacher; verify it creates a working staff/faculty account. Prepare a second faculty account for unrelated-section access tests.
- [x] Cover all supported account types in the matrix below. Utility and staff-role/admin-department combinations are legacy schema values outside the current browser scope, per owner clarification; no fixtures are created for them.
- [ ] Verify sign-in, role landing page, logout, wrong-credential handling and direct protected-link access for each relevant account. Account/department/password changes and archive-based session revocation should use designated QA accounts only.

| Account | Required checks |
| --- | --- |
| Admin role | User management, department administration entry points, authorized administrative operations. |
| Staff / registrar | Intake, Teachers, Subjects, Sections, School Years, Students, Enrollments and Messages. |
| Staff / clinic | Own physical-exam queue/history and approvals; no unrelated department actions. |
| Staff / guidance | Own guidance queue/history and approvals; no unrelated department actions. |
| Staff / accounting | Website tuition-clearance queue/history; verify internal accounting-app access for Part 3. |
| Staff / faculty | Faculty-assisted intake and pending-enrollment tracking, assigned advisory sections and grades; deny registrar final approval/status changes and another adviser's section. |
| Legacy staff / admin department | EXCLUDED: creation UI maps Administrator to the actual admin role. Owner questioned this unsupported combination; no database fixture added. |
| Legacy staff / utility department | EXCLUDED: enum exists, but no creation option or dedicated portal. Owner treats it as potentially stale; document as cleanup observation, not missing functionality. |
| Student role | Test the accounts created by registrar, status visibility, profile, history/year selection and restrictions. |
| Signed out | Protected pages/actions denied; unified login works. |

### 2.2 — Academic setup

- [x] Create/select the approved school-year record with valid dates and activate it. Verify the active year appears consistently across department screens.
- [x] If old/returning and year-history cases need historical records, prepare a previous QA year/cohort within the approved test scope; do not reuse arbitrary real students or repeatedly alter a live active year.
- [x] Create at least two QA subjects in Registrar -> Subjects; verify create, edit, search, archive and restore using test records.
- [x] Create/edit the QA teachers and verify they appear in adviser/subject-teacher pickers. Check duplicate-email handling and archive/restore behavior.
- [x] Create QA sections for the chosen grade levels/year; set an adviser and room. Verify that an empty section can be created without subjects and that optional adviser/room behavior matches the UI.
- [ ] Build each section's class schedule: add subjects, select teachers and enter weekday/time. Verify saved values after reload, edit, remove/restore and duplicate-subject rejection. Observe handling of missing teacher/time, invalid time order and schedule conflicts rather than assuming validation exists.
- [ ] Prepare a second section/adviser and a different-grade/year section for permission and assignment-boundary checks.

### 2.3 — Registrar intake and student accounts

Use the wizard's actual sequence: **Identity -> Bio-data -> Family -> Details -> Review -> Confirm & Create**.

- [x] Run one complete new-student happy path first, including the newly generated account, pending enrollment record and appearance in Clinic's queue.
- [x] Record student/user/enrollment IDs and retrieve generated credentials through the product for testing; keep passwords out of committed documentation.
- [x] Sign in as the new student before clearance completion and verify the dashboard displays the pending state rather than reporting final enrollment.
- [x] Exercise the following scenario matrix, reusing fixtures only when it does not collide with the one-form-per-student/year constraint.

| Scenario | Key checks |
| --- | --- |
| New nursery/kindergarten | Early-grade fields, optional LRN behavior and guardian requirements. |
| New elementary | Standard new account/profile/form creation; valid unique LRN where supplied. |
| Transferee, junior high | Previous-school fields, ESC flag, later registrar ESC-number updates and duplicate identity checks. The wizard does not submit an ESC number. |
| Old student | Existing-profile search/reuse across years; no second user/profile creation. |
| Returning / Balik-Aral | Existing-profile reuse and last-school/year details. |
| Senior high / Academic | Grade 11/12 learner category, required SHS track and voucher flag. |
| Senior high / TechPro | Alternate SHS track, persisted details and correct categorization. |

- [x] Check missing required fields, malformed email, invalid LRN, guardian contact length, duplicate email/LRN and repeated enrollment for the same student/year.
- [x] Check Back/Cancel, search results, review accuracy and saved bio/family/enrollment fields after reload; verify failed creation does not leave a partial account/profile/form.
- [x] Run a faculty-assisted intake separately: verify account creation and assisted-by attribution, pending tracking, and absence of registrar final-approval/status permissions.
- [x] For an existing student, verify guardian name/contact on the new year's form and compare reviewed bio/family edits with persisted data. The former payload omission was reproduced and fixed as P2-05; confirm reviewed fields persist after reload.
- [x] Review all grade options and learner-category mapping; use representative cases above rather than presenting untested grade combinations as passed.

### 2.4 — Department clearances and final enrollment

- [x] Clinic: locate the pending QA student, complete the physical/medical-history fields with synthetic data, approve, edit the record where supported, and verify queue/history transitions.
- [x] Guidance: verify the student is unavailable in the pending queue before Clinic clearance and appears after it; complete synthetic assessment data, approve and verify saved history.
- [x] Website Accounting: verify the student appears after Guidance; record only synthetic tuition-clearance information, notes and SI reference where applicable.
- [x] Exercise full payment, down payment and promissory note: each currently sets Accounting done. Exercise insufficient payment: it must leave Accounting incomplete. These are enrollment clearance records; contracts/payroll/ledger belong to Part 3.
- [x] Registrar: verify final-enrollment controls remain unavailable until Clinic, Guidance and Accounting are complete; finalize and confirm pending -> enrolled lists/statistics and the student's dashboard update after reload.
- [x] Verify approver attribution and notes reflect the actual department account used, not an admin-only shortcut.
- [x] Check server enforcement in isolated regression tests: final approval and re-enrollment status changes must be assessed alongside Guidance-before-Clinic and Accounting-before-Guidance attempts. Current queue/UI gating does not establish mutation enforcement; see the source findings below.
- [x] Observe final-enrollment Accounting reversal in a separate disposable regression fixture (API only; the UI does not offer insufficient). Enrollment/roster remain active and approval metadata unchanged. Policy requires client confirmation; no reversal policy was implemented.
- [ ] Check repeated approvals/edits, invalid or missing form IDs, archived records and inactive/historical years. Verify the accepted historical-edit policy rather than treating every historical edit as inherently invalid.

### 2.5 — Section assignment and adviser workflow

- [x] Confirm assigning a pending student is rejected.
- [x] Assign the fully enrolled QA student to the prepared section with the matching school year and grade; verify membership in Registrar's roster and the adviser's view.
- [x] Reject different-year, different-grade and duplicate assignments; test unassign/reassign using designated QA records.
- [x] Verify the appointed adviser sees the section and its roster/subjects; verify the second faculty account cannot read or change another adviser's restricted grades.
- [x] Save, edit and clear test subject grades and general averages; reload to verify persistence. Check valid boundaries, invalid values, unrelated students/subjects, duplicate entries and failed-batch rollback with appropriate isolated regression tests.
- [x] Keep grade-save authorization distinct from subject-teacher scheduling: the current advisory grade action authorizes the section adviser, or admin.

### 2.6 — Student portal and remaining registrar features

- [ ] Recheck each registrar-created student's dashboard before/after clearances and final enrollment, with the correct grade, learner/student type, track, ESC/voucher flags and school-year history.
- [ ] Check student profile fields and available editing controls, reload persistence, own-record isolation and denial of admin/staff/internal-accounting access.
- [x] Record the current student `/dashboard/student/grades` redirect to the dashboard. The route is explicitly disabled in source; do not label absent grade display a defect or promise grade publication without confirming intended scope.
- [ ] Check Registrar Students/Enrollments search, filters, details, notes, ESC updates, status changes and archive/restore using QA records.
- [ ] Check dropped/transferred/re-enrolled and registrar approval revocation using separate QA cases; verify department/student views remain coherent.
- [x] Check local Registrar Messages and available Clinic/Guidance print previews. The Part 1 message is retained in the original database and was not copied; physical printing and exhaustive print/download variants remain untested.
- [x] Exercise school-year rollover on approved QA years after verifying the baseline fixtures: section/schedule import, repeat import, archive/active rules and historical views. Use the verified option behavior below.
- [ ] Switch year context and reload each view: department queues use the active year, registrar/faculty lists can select a year, and the student dashboard defaults to the active year. Verify historical forms remain readable where supported and that changing a list filter does not silently change the wizard's displayed year destination.
- [ ] Archive/restore a QA student and check both profile and login account behavior, existing sessions, queues and rosters. Student archival updates both records; dependent enrollment visibility needs its own verification.

### Second source cross-check — verified behavior and boundaries to test

These are source findings, not browser test results. The dependency order above remains correct.

| Area | Verified implementation | Consequence for the walkthrough |
| --- | --- | --- |
| Faculty intake | Faculty uses the shared enrollment list/wizard; intake accepts registrar/faculty staff. Registrar-only approval/status controls are hidden for faculty. | Include an assisted enrollment and test server authorization separately from hidden controls. |
| Existing student | P2-05 now sends reviewed profile and guardian fields while reusing the student ID. Profile update and enrollment creation share one transaction. | Returning-student browser retest and failed-duplicate rollback regression passed. |
| Clearance sequence | Pending queues filter previous clearance; approval SQL now also enforces prerequisites. | Out-of-order action attempts reject in real PostgreSQL regression coverage. |
| Final approval/status | Final approval and re-enrollment SQL now require all clearances and a nonarchived form. | Both paths reject incomplete clearances in regression coverage; normal browser final approval passed. |
| Clearance reversal | Accounting edits can set its done flag false without changing `isEnrolled`; the edit query does not update completion timestamp/approver fields. | Check approved-to-insufficient transitions and audit metadata; establish intended behavior before implementing changes. |
| Year context | Department queues resolve the active year. Registrar/faculty lists support selected years; the registrar wizard submits its selected year. Student dashboard defaults to active year and returns no record when none exists. | Verify no-active-year and historical navigation explicitly; do not infer intake destination from the list filter. |
| Rollover | Copies nonarchived source sections; matching target name/grade sections, including archived ones, are skipped. Existing target sections are not updated. | Test fresh import, repeat import and archived-target collisions separately. |

Rollover options in the current implementation:

- `copySections`: enables the import. When false, the query still validates numeric IDs and rejects a same-year pair, then returns zero without checking whether those years exist.
- `copySubjects`: copies subject assignments to the new sections using the existing global subject IDs; it does not create new catalog subjects.
- `copyTeachers`: retains existing adviser/subject-teacher IDs on copied records; it does not create teacher accounts.
- `copySchedules`: retains weekday/start/end values on copied subject assignments. It has no effect without `copySubjects`; section room is copied regardless.
- Students, enrollment forms, rosters and grades are not copied. No student promotion, automatic re-enrollment or target-year activation occurs.

Check duplicate enrollment/subject/roster submissions as well as ordinary validation. Source prechecks are not proof against concurrent requests; use isolated regression coverage for concurrency and rollback rather than repeatedly submitting against client records.

### 2.7 — Part 2 checkpoint

- [x] Add an execution row for each completed step: account, prerequisite/test-record ID, expected result, actual result, PASS/FAIL/BLOCKED, evidence and retest status.
- [x] Fix confirmed in-scope defects and rerun affected workflows: P2-01 through P2-12 verified as recorded.
- [x] Owner requested committing/pushing the tested Part 2 changes and next-session note before shutdown. This does not authorize merging or mark all coverage complete.
- [x] Record every retained QA account/year/subject/section/student/form/clearance/grade and its cleanup disposition. Preserve the fixtures needed by Part 3.
- [x] Review the findings and stop before Part 3. PR #41 stays open until both workflow stages have been assessed.

Source references: `packages/api/src/enrollment/{action,query}.ts`, `packages/api/src/sections/{action,query}.ts`, `packages/api/src/faculty/{action,query}.ts`, `packages/api/src/{clinic,guidance,accounting}/query.ts`, `packages/db/src/schema/shared/enums.ts`, Registrar's enrollment wizard/section subject dialog, faculty advisory-grade actions, and the student Grades route. The original plan below retains unchecked composite items where complete browser coverage is absent; the final continuation above identifies action-level coverage and specific remaining limits.

## Part 3 planned checklist — internal accounting

Status: not started in this walkthrough. Accounting Forms excluded pending client material. Stop for review after completion.

- [ ] Inventory every accounting tab/action and prerequisites; use the QA accounting account from Part 2.
- [ ] Create clearly marked employee/test records as required and run every supported contract type through creation, editing, validation and persisted reload.
- [ ] Exercise applicable deductions, allowances, opening balances and contract status/history features.
- [ ] Create and process designated test payroll periods, verify amounts/statuses and duplicate/invalid-date rejection.
- [ ] Exercise loans, balances, payments and payroll deduction behavior, including the documented manual posting workflow.
- [ ] Exercise receipts, receipt items, duplicate-number validation and relevant filters/reports.
- [ ] Reconcile affected ledger entries and balances against the test operations.
- [ ] Check every available accounting tab, search/filter, edit/detail view and print/export feature; exclude deferred Forms.
- [ ] Verify role restrictions and persisted results after reload; separate any real financial commitment from synthetic test bookkeeping.
- [ ] Record findings, retained test records and retest results, then stop at the Part 3 checkpoint.

## Part 2 continuation — 2026-10-03

The previous disposable browser cluster under `/tmp` did not survive shutdown. Prior results and committed fixes remain valid, but the previous fixture IDs no longer identify live retained records. Recreated an isolated PostgreSQL 18 cluster inside ignored `tmp/qa-runtime/.qa-postgres`, migrated the repository schema, seeded only the authorized synthetic admin, and verified both QA app environment files still target loopback 55442. Product changes through commit `94aae222` synced selectively into the runtime; original app environments remain untouched. The website restarted on 3101; internal accounting on 3102 remains outside this Part 2 continuation. New fixture IDs/results will be recorded below.

Runtime restart: from `tmp/qa-runtime`, load WSL NVM, run `node qa-restart.mjs` for the retained local cluster/bridge, then `pnpm --filter website exec next dev --turbopack -p 3101 --hostname 127.0.0.1`. Never rerun the first-time bootstrap against the retained cluster.

### Resumed account checks

| Check | Account / new fixture | Result |
| --- | --- | --- |
| Supported account creation | User 2 QA Resume Registrar | PASS: created through Admin UI, working Registrar login. |
| Profile edit | User 2 | PASS: Resume Middle persists after reopening editor and appears on fresh sign-in. |
| Registrar -> Guidance change | User 2 | PASS: saved department Guidance; old Registrar browser session redirected home after reload. Fresh sign-in opens Guidance; direct Registrar Students URL redirects to Guidance. |
| Guidance -> Faculty change | User 2 | PASS: old Guidance session revoked; fresh Faculty login opens enrollment/advisory navigation. |
| No active year / Faculty | User 2, no school years | PASS browser: Advisory Grades displays No active school year found. Saved evidence `qa-part2-resume/faculty-no-active-year.png`. |
| Restore Registrar department | User 2 | PASS: account directory returns to Registrar; same profile retained. |
| Password-test preparation | User 3 QA Password Test | Created through UI, two independent browser-host sessions established. Owner-operated new password entry/submission pending. No password is recorded here. |
| P2-13 Administrator profile edits | Disposable regression | FAIL reproduced: save reports success, last name remains Original. Fixed update branch to include admin staff profiles; profile edit and Admin -> Clinic -> Admin role/department consistency now pass. Browser retest subsequently passed (see continuation below). |
| Validation after P2-13 | Original repository | PASS: 40 workflow integration tests, 40 unit files / 222 tests, website and accounting type checks. |

The localhost, 127.0.0.1 and qa-admin.localhost browser hosts all reach the same loopback QA website/database. Separate host cookies allow session-revocation checks without logging out the working Admin or interrupting owner password entry. These are not additional app/database instances.

| Continued check | Fixture | Result |
| --- | --- | --- |
| Administrator profile browser retest | New user 4 QA Resume Admin | PASS: middle name Updated saved and persisted after full reload. Evidence `qa-part2-resume/admin-profile-fixed.png`. |
| Administrator -> Clinic -> Administrator | User 4 | PASS: directory role/department changed together; Clinic fresh login shows correct name/navigation; restored Admin fresh login shows System Administration. Old Clinic session redirected home after restoration. |
| Admin role filter | Users 1 and 4 | PASS: only the two Admin records are listed. |
| Account archival confirmation | User 4 | PASS: wrong email leaves Archive Account disabled; exact email enables it. Archive removes active row and revokes its existing browser session. |
| Archived login | User 4 | PASS: correct credentials rejected with Your account has been deactivated. |
| Account restore | User 4 | Native Restore this user? confirmation awaiting owner. Browser API returns no accessible dialog; action was not retried. |

### P2-14 — Selected historical enrollment revoke

A historical tracking dialog passed only the student ID to `revokeRegistrarApproval`; the action resolved that student's active-year form. A real PostgreSQL regression reproduced active-year enrollment becoming false while revoking a selected historical record. The dialog now supplies both student ID and form ID. The action validates form ownership and archived state, and updates the explicitly selected form. The one-argument API still resolves the active form for existing callers. Selected historical revoke, unrelated/missing/archived form rejection and default active-year revoke now pass. Native browser retest remains pending after rebuilding enrollment fixtures.

Latest validation after P2-14: 41 isolated workflow tests and 222 unit tests pass; both app type checks, targeted Biome and whitespace checks pass. P2-13 browser retest passed; P2-14 browser retest is not yet claimed. New fixes remain uncommitted.

Earlier owner handoffs: password change for synthetic user 3 and native Restore this user? for user 4. At that point, read-only checks showed the old password matching for user 3 and user 4 archived. Browser dialog API exposes no dialog; documented Return keyboard recovery timed out and did not restore the record. Native confirmation blocks further browser input; no click was retried. Continue immediately after owner confirmation, verify actual record/UI state, then recreate the academic/enrollment fixtures for remaining ESC, roster, print and search checks. Part 3 has not started.

- 2026-10-03 continuation: owner accepted user 4 restore; active Directory shows the account again and fresh login reaches its Admin dashboard. Initial browser error boundary recovered with Try again; server login succeeded. Academic prerequisites are being recreated through the UI; Part 2 remains in progress.
- Current replacement fixtures: school year QA 2026-2027 created and activated through UI (2026-10-01 to 2027-10-01); synthetic QA Resume ESC intake created through all five wizard steps, Grade 7 Junior High, ESC enabled. Required family-field rejection observed before completion. Tracking waits for Clinic and offers no premature final approval. Clinic clearance via Admin moved Pending 1 -> 0 and History 0 -> 1; approval attribution and generated /print/clinic/1 identity, notes and signature verified. Guidance clearance issued through both form tabs with synthetic notes. No real medical/assessment data. Physical printing remains untested.
- Owner accepted final enrollment confirmation for QA Resume ESC: Pending 1 -> 0, Enrolled 0 -> 1. ESC browser set to a synthetic identifier, full reload/reopen retained it; clearing saved and reopened blank. Guidance history/print show expected school year, Grade 7, identity, birthdate, current/permanent address and student signature name. Website Accounting clearance moved pending to history; no financial transaction. Class QA Resume G7 created without adviser/subjects, then student assigned through enrollment picker; class count became 1 enrolled. Roster removal/reassignment and historical-form browser revoke remain in progress.
- Coverage correction: enrollment tracking only renders an approve action; no UI calls handleAction(revoke), and the dialog selects pending (not enrolled) forms. Therefore revoke/reapprove and P2-14 historical revoke remain API-regression coverage, not a pending browser action. No new revoke UI has been added. Browser re-enrollment/history and roster/academic controls remain to be checked.
- Current browser blocker: native "Unassign QA Resume ESC from this section?" on qa-staff.localhost:3101/registrar section detail. Dialog API returns no accessible handle; no action click retried. Read-only section_rosters verification still shows the assignment active. Owner confirmation requested asynchronously; removal/reassignment remains pending. Password user 3 still matches the old QA password; owner credential entry/submission remains pending. QA sessions preserved and local synthetic database backup refreshed.
- Owner accepted Unassign for QA Resume ESC: class detail now shows 0 enrolled and an empty roster. Reassignment through enrollment picker passed. Read-only database verification confirms one archived prior roster and exactly one active replacement. Next native confirmation is Archive Section for QA Resume G7; owner click requested with commentary notification.
- Section archive browser check passed after owner confirmation: Active 1 -> 0, Archived 0 -> 1. Archived list shows QA Resume G7 with its existing 1 enrolled roster. Native Restore this section? is now pending owner confirmation.
- Section restoration passed: Active 1 / Archived 0, roster retained. Created/activated QA 2027-2028 through UI; exactly one active year verified. Existing-student LRN search returned QA Resume ESC with prefilled identity/address; new guardian details required and Old Student defaulted. Created Grade 8 form without generating new credentials. Read-only verification: one student/account, prior year Grade 7 enrolled true, new year Grade 8 enrolled false, one active prior roster. Historical-year selector shows old enrollment/class intact and separate pending/enrolled counts.
- Historical enrolled search: nonmatching query shows empty state/count 0; LRN query restores the Grade 7 record and preserves sy=1/tab=enrolled. Registrar-created student credentials sign in; current-year portal is locked at pending Clinic, profile matches identity/address/guardian, direct Admin users access redirects away, historical syId=1 shows Enrollment Verified for QA 2026-2027. Owner completed Password Test change: old session reload redirected to public home, old password rejected. New-password sign-in verification in progress.
- Password Test new-password login passed, completing owner-operated change, old-session revocation, old-password rejection, fresh login. School-year archive browser check now pending native confirmation for inactive QA 2026-2027; active QA 2027-2028 archive control is disabled. Working Registrar session is 127.0.0.1 user 3; qa-staff Admin session was logged out during navigation and is not currently signed in.
- School-year archive/restore browser tests passed: old year moves to Archived and returns as inactive; new year stays active. Account Staff filter passed. Duplicate email edit rejected with Email already in use; unique replacement email saved and fresh Registrar login passed; original fixture email restored. Email-only edits retain the existing session (unlike role/department/password/archive changes); no expanded access was observed.
- Subject catalog QA Resume Mathematics / QA-MATH created through Registrar UI. Archive confirmation accepted: Active 1 -> 0 and Archived 0 -> 1; archived row retains name/code/description. Restore subject confirmation currently pending owner click.
- Subject restoration passed: Active 1 / Archived 0 and original code/name/description retained. Historical Grade 7 drop with custom synthetic reason passed: Enrolled 1 -> 0, Dropped 0 -> 1, reason/date persisted, student historical view displays Enrollment Dropped. Further source/UI cross-check: no same-form re-enrollment restoration control exists; only dropped/transferred status choices are rendered. Same-form restoration remains API-regression coverage; new-year returning intake passed in the browser. This is a product workflow decision, not a browser check left to click. Retain old form dropped as intentional synthetic lifecycle evidence.
- Student archive accepted through UI: Directory Active 1 -> 0 / Archived 0 -> 1, student and user archive flags both true, old student session reload redirected to public home, active-year pending enrollment list now empty. Two forms and prior roster retained in storage. Restore Student native confirmation pending owner click.

### Continuation review — archive token limitation

Student restoration returned the active profile and pending Grade 8 enrollment. An unexpired pre-archive browser token became authenticated again immediately after restore, without sign-in. Auth uses stateless JWTs and checks current archive flags, password fingerprint, role and department; no stored session or revocation generation exists. Earlier archive notes saying "revoked" describe blocked access while archived, not permanent token revocation. Password-change revocation remains verified because the fingerprint changes. No product patch has been made for this finding. A persistent token generation/revocation mechanism needs design, migration and regressions before claiming permanent archive revocation. This is a follow-up security finding and Part 2 is not an unconditional all-clear.

Completed this continuation: profile/department/Admin transitions, password change and sign-in, ESC set/reload/clear, returning enrollment/year isolation, student profile/protected Admin denial, Clinic/Guidance print pages, roster removal/reassignment, section/school-year/catalog-subject archive/restore, duplicate/unique email validation, historical drop display, student archive/restore and pending visibility. Revocation and same-form restoration have no rendered UI controls and remain API regression coverage. Exhaustive input/filter/role combinations, protected mobile/cross-browser, physical printing and production deployment are not claimed. Part 3 remains unstarted.
- Final student recovery verification: Active Directory shows Grade 8 student; pending enrollment restored to 1; explicit logout followed by fresh generated-credential sign-in passed. No native prompt or owner input pending. Local fixture inventory: users 1–4 supported staff/Admin plus user 5 student; student 1; school years 1 (inactive) and 2 (active); forms 1 (historical dropped) and 2 (pending Clinic); section 1 restored; subject 1 QA-MATH restored. Prior roster retained, with one archived removal and one active storage row; no production records changed. New product fixes P2-13/P2-14 remain uncommitted; no additional code was changed for the token finding.

### P2-15 — persistent archive-session revocation (2026-10-03)

The previous limitation above records the observed defect before this fix. Added migration `0018_broad_firedrake.sql` with non-null `users.session_version`, default zero. All three user archive paths increment it alongside the archive flag; restoration preserves it. JWTs carry the version and fresh-state authentication validates it. Pre-migration JWTs represent zero, preserving unaffected logins until archive. Password fingerprint checks remain in place.

- [x] Session regression: old token denied while archived and after restore; fresh login accepted.
- [x] Student archive/restore queue regressions assert the persisted version.
- [x] Teacher archive/restore regression asserts the version is not reset.
- [x] Added Administrator account archive/restore version regression.
- [x] Applied migration only to isolated local QA, after verifying loopback database configuration.
- [x] Browser: existing student session denied after archival.
- [x] Browser: restored account returns to Active; unchanged pre-archive session remains denied; fresh generated-credential sign-in reaches the student dashboard with its pending Clinic enrollment. Read-only local database verification confirms user 5 is active with session_version 1.

Final verification: 223 unit tests, 42 PostgreSQL workflow tests, both app type checks, targeted authentication lint and whitespace checks passed. Changes remain uncommitted; PR #41 remains open and Part 3 has not started. Deployments must apply this migration before either app uses the new source.

P2-15 browser retest is complete. No native confirmation or owner input remains pending. Part 2 is ready for coverage review; exhaustive combinations, protected mobile/cross-browser, physical printing and production deployment remain unclaimed.

## Part 2 mobile and browser checkpoint — 2026-10-03

The owner deferred physical printing and authorized finishing available mobile/browser checks, committing and pushing. Testing used accessibility-based interaction in the Codex in-app browser and the isolated local QA website. Actual screenshots confirmed a 390 × 844 mobile viewport and 1280 × 720 desktop view. The viewport API applied inconsistently between tabs; all mobile observations below were made in the tab whose screenshots confirmed the narrow size. No 320px/tablet or second browser-engine result is claimed.

### P2-16 — responsive layouts and accessible controls

Confirmed and corrected: mobile Account Settings navigation left the sidebar open; mobile menu/password visibility controls lacked names; student editor fields lacked label associations; editor tabs/birthdate row overlapped; wizard steps clipped; enrollment year/action controls overlapped and status tabs overflowed; Admin filter groups overflowed; Clinic review cards placed Review beyond the card; Guidance and enrollment payment-clearance tabs extended outside the viewport.

- [x] Student dashboard, profile and security settings fit the mobile page; navigation menu opens by keyboard and closes for profile and Settings links.
- [x] Menu expanded state and password visibility toggle names/state exposed correctly; Space toggles visibility and masking was restored. No password change was submitted in this pass.
- [x] Student editor opens by keyboard; Basic/Family tabs support arrow navigation; text fields, birthdate and gender have names; mobile rows/tabs fit; Escape closes it.
- [x] Intake wizard entry and Bio-data view inspected without creating another account; all five step indicators fit; close control/search and associated text-input labels named.
- [x] Registrar Students, Enrollment, School Years, Teachers, Subjects and Class Builder mobile lists inspected. Wide tables scroll within their containers. Teacher page was empty in the current fixture set.
- [x] Class Builder year selection works by keyboard; historical section details and roster tab open on mobile.
- [x] Admin directory filters and New Account action fit after correction; user search has a name.
- [x] Clinic pending card and Review dialog inspected without approving or changing data. Review action stays inside the mobile card after correction.
- [x] Guidance and website payment-clearance queue/history tabs fit after correction; current queues were empty. These checks do not cover the internal accounting app.
- [x] Faculty enrollment view and advisory empty state inspected through the existing QA Admin; this is layout evidence, not another Faculty permission-matrix test.
- [x] Desktop Enrollment layout rechecked after responsive changes.
- [x] Physical printing explicitly deferred by owner.
- [ ] Additional browser engines/devices, tablet/320px sizes, full populated-state matrix, exhaustive input/filter/download combinations and production deployment remain outside this checkpoint.

Selected controls were corrected; this is not a comprehensive protected-screen accessibility audit. Previously observed unnamed school-year/subject edit controls and school-year dialog fields remain candidates for a separate accessibility pass. Native print pages have been reviewed; physical printer output remains deferred. Client policy questions above remain unresolved. Part 3 has not started.

Final automated checks: 223 unit tests and both app type checks passed. The 42 real PostgreSQL workflow tests passed after P2-15; P2-16 changes presentation and accessible names only. Changed-file lint has zero errors and four existing warnings; whitespace checks passed. Migration 0018 must precede deployment of either app. Code checkpoint `a1302521` was committed and pushed to `codex/forms-and-fixes`. PR #41 remains open and unmerged; this is a backup/review checkpoint.


## Part 3 accounting checkpoint — 2026-10-03

Core supported accounting walkthrough completed with representative local synthetic records, primarily staff/Accounting. Findings P3-01 through P3-05 fixed and retested. Detailed step checklist, financial reconciliation, fixture disposition and limits: [QA-PART3.md](QA-PART3.md). Deferred work: [ACCOUNTING-FUTURE-FOLLOWUPS.md](ACCOUNTING-FUTURE-FOLLOWUPS.md).

229 unit tests, 26 real PostgreSQL integrity regressions, both app type checks and full lint (0 errors, 40 existing warnings) pass. Four accounting print routes now check role/department before querying data; student and anonymous matrix passed. The owner authorized committing and pushing the Part 3 checkpoint to PR #41. Verify its new CI run before merge. Forms and physical printing remain deferred.
