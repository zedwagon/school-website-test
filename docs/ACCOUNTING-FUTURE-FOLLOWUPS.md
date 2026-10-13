# Accounting follow-ups

Recorded 2026-10-03 after the core Part 3 walkthrough.

- [ ] Broader accessibility: give payroll edit icon buttons specific names, associate loan fields with labels, and give payslip selectors an employee-specific name. Retest keyboard operation and screen readers.
- [ ] Broader mobile/device/browser coverage, populated larger rosters and long names.
- [ ] Native print-preview pagination and physical printing: physical printing remains owner-deferred.
- [ ] Additional contract type conversions, every field boundary, every report filter and malformed URL combination. Representative tests do not certify all combinations.
- [ ] Client clarification if needed: UI allows loans for active regular employees with contracts and excludes Part-Time Teaching. Do not change eligibility without agreement.
- [ ] Clarify whether a distinct payroll PAID stage is needed. Current UI exposes Completed and Revert to Draft; API/schema retain PAID. No new workflow was introduced during QA.

Cash Receipts currently stores daily receipts/deposit totals; numbered receipt items are not an existing UI workflow. Invoice/payment placeholder pages are outside the agreed current scope. Accounting Forms remain deferred until supplied.
