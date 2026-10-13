# Part 3 accounting QA

Updated 2026-10-03. Branch codex/forms-and-fixes; PR #41 remains open. Core supported workflow walkthrough completed with representative synthetic records. This is not exhaustive certification of every input, employee count or device.

## Environment

Local PostgreSQL 18 on loopback 55442, WebSocket bridge 55443, accounting app 3102, website 3101. QA transport rejects database URLs outside the local cluster. No remote database writes, real employee data, financial transfers or deployment builds. Forms excluded pending client material; physical printing deferred.

## Executed checklist

- [x] Start accounting and verify isolation guard.
- [x] Main walkthrough as staff/Accounting; Admin access separately.
- [x] Student and non-Accounting staff denied dashboard; anonymous requests redirect to login.
- [x] Create Administrator, Teaching, Non-Teaching and Part-Time Teaching employee profiles through UI; blank required-name submission blocked.
- [x] Create all four contract types; allowances, EE/ER contributions and reload persistence.
- [x] Teaching/Non-Teaching/Part-Time filters; active, inactive and no-contract states; deactivate/restore retained contract.
- [x] Edit teaching position allowance and verify generated payroll uses updated contract.
- [x] Create first/second cut-offs; duplicate and reversed dates rejected by server without inserting periods.
- [x] Generate all four types; regular totals and odd-cent half salary reconcile.
- [x] Part-time class count updates earnings; draft regeneration resets count as warned and avoids duplicate rows.
- [x] Create loan, regenerate suggestion, complete payroll, revert to Draft and complete again; completed controls locked.
- [x] Manual salary unlock/edit and overload adjustment; odd-cent half-pay fix; save/reload net amount.
- [x] Next cut-off excludes inactive employee and fully repaid loan; completed prior period retains original records and deduction.
- [x] Payroll summary and four-type payslip data inspected; Teaching summary filter and batch select/deselect controls.
- [x] Post loan payments manually; one-cent overpayment rejected; exact final balance marks PAID; ledger retains both payments.
- [x] Save daily receipts/deposits for two dates; short/over values and receipt-summary totals reconcile.
- [x] Change one deposit; updates its single linked ledger entry.
- [x] Add expense and monthly opening override; running balances and next-month carry-forward reconcile.
- [x] Ledger range report applies overrides; single-month filter also retains correct closing balance.
- [x] Protect all four print routes before querying financial data; student and anonymous browser matrix passes; other-staff summary denied; Admin and Accounting reports still work.
- [x] Representative 390x844 Contracts, Payroll and Ledger inspection; fix Operational header/form and Contracts header; menu closes after navigation and controls gain accessible names.
- [x] Restore non-teaching employee and temporary staff department; old Accounting session revoked.
- [x] Full lint, unit tests, both app type checks and affected database integrity suite.

## Confirmed fixes

| ID | Finding | Change and retest |
| --- | --- | --- |
| P3-01 | Multi-month ledger print ignored later opening overrides, showing 1350.35 instead of 6350.85 | Merge monthly reset rows before transactions; integer-cent report arithmetic; 3 regressions and browser single/multi-month retests. |
| P3-02 | Mobile Operational header/form and Contracts header squeezed/clipped controls | Stack headers/entry fields, wrap filter controls, constrain main content, name menu/month/opening controls; browser retest at 390x844. |
| P3-03 | Manual salary editor rounded 26000.01 half-pay down to 13000.00 | Use the same integer-cent rounding as generation; browser shows 13000.01 and saved net 13650.46 after overload. |
| P3-04 | Accounting print routes exposed payroll/operational records outside Accounting roles | Every print page checks Admin or staff/Accounting before fetching data. All four routes reject students and signed-out users in browser; non-Accounting staff and authorized roles checked separately; 3 guard regressions. |
| P3-05 | Local unit discovery included copied tests under ignored tmp/qa-runtime | Exclude tmp/** in root Vitest config; normal unit command now selects 42 suites. |

## Amount reconciliation

First completed period: Administrator monthly 20000.01 => half 10000.01, EE deductions 800.60, net 9199.41. Teaching monthly 24000, position 600.25, advisory 750.10, earnings 13350.35, EE 800 plus loan 400, net 12150.35. Non-Teaching monthly 18000, extras 700.50, deductions 730, net 8970.50. Part-time rate 350.25 times 10 classes => 3502.50; subject hours 2.50 are displayed separately, not multiplied into pay.

Loan principal 1000.01; payments 400 and 600.01 => zero/PAID. Completing payroll alone did not change the loan balance, as documented.

Final October daily receipts 1500.25, deposits 1550.40, over 50.15. Opening 5000.50 plus deposits minus expense 200.05 => 6350.85; November automatic opening also 6350.85.

Second period retained DRAFT with three employees at generation because Non-Teaching was then inactive; employee restored afterward. Teaching manual snapshot now uses base 26000.01, half 13000.01, extras 1450.45, EE 800, net 13650.46. First completed payroll and contract remain unchanged by this period-only adjustment.

## Checks and limits

229 unit tests in 42 suites pass. 26 opt-in real PostgreSQL accounting/school-year integrity regressions pass in a separate disposable cluster on 55440. Both app tsc checks pass. Full lint: zero errors, 40 existing warnings. git diff --check passes. No production build or migration run.

First test attempt accidentally collected the QA source copy too, causing a second suite to collide on its disposable test port. Excluding tmp removed the duplicate; isolated rerun passed. A transient Turbopack module-factory error after hot edits cleared on dev-server restart; no production-runtime claim is made.

Representative mobile screenshots confirmed 390x844; desktop 1280x720. Other engines/devices, native print-preview pagination, physical printing, exhaustive fields/filters and production deployment behavior remain unclaimed. See ACCOUNTING-FUTURE-FOLLOWUPS.md.

## Retained fixtures and continuation

Four synthetic employees and contracts retained. Loan is PAID with two payments; first payroll COMPLETED, second DRAFT. Receipt/ledger fixture totals above retained. QA Resume Registrar temporarily became Accounting using its existing QA credential, then was restored to Registrar and its Accounting session was revoked. Dedicated QA Accounting Sweep was created with a UI-generated password that was not captured; no password changed. Use Admin for future read-only review, or switch the known synthetic staff account again for Accounting tests. Do not use real accounts.

The owner authorized committing and pushing this Part 3 checkpoint to codex/forms-and-fixes for PR #41. No merge or deployment is authorized. Local verification results above precede the checkpoint; verify the resulting GitHub CI run before merge.
