# Enrollment follow-ups for future work

Recorded 2026-10-03 after Part 2 QA. These items are deferred follow-ups, not approval to change school policy. Core walkthrough results and verification limits remain in [QA-TRACKER.md](QA-TRACKER.md).

## Accessibility fixes

- [ ] Give School Year and Subject edit icon buttons accessible names.
- [ ] Associate School Year form labels with their text inputs and date controls.
- [ ] Retest those controls using the browser accessibility tree and keyboard navigation; inspect other protected-screen controls in a separate accessibility pass.

The observed controls work visually, but unnamed controls or unassociated labels can make their purpose unclear to screen-reader users. The mobile/session fixes already completed are recorded separately in the QA tracker.

## Decisions to discuss with the school

| Done | Topic | Decision needed | Current observation |
| --- | --- | --- | --- |
| [ ] | Payment clearance after final enrollment | Should insufficient payment clearance impose a financial hold, or revoke enrollment and change roster access? Who should be recorded as making the change? | An API-only change to insufficient leaves enrollment/roster active and retains original approval metadata. The website selector does not offer insufficient. |
| [ ] | Timetable overlaps | Should overlapping classes be blocked, warned about, or permitted? Confirm the relevant teacher, room and section conflict rules. | An overlap policy has not been established in this QA stage. |
| [ ] | Clinic answers | Should unanswered questions stay distinct from No? How should female-only questions appear for male students? | Current representation needs policy review before changing defaults or stored answers. |
| [ ] | Student enrollment history and details | Should students get a visible historical school-year selector and additional track, ESC and voucher information? | Historical status is available through the year URL parameter, but the profile does not display every enrollment field. |

After each decision, record the agreed behavior, implement it as a separate change, and verify the affected staff/student views and historical records. Do not change financial or medical behavior solely from assumptions.

## Deferred verification

- [ ] Physical printing: explicitly deferred by the owner; print-page inspection was completed.
- [ ] Additional browser engines/devices and tablet/narrower viewport sizes.
- [ ] Exhaustive populated-state, field, filter and download combinations beyond the representative walkthrough.

Accounting Forms remain excluded until the owner supplies the client documents. This document is internal and is excluded from the production mirror with the rest of docs/.
