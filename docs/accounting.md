# Accounting workflows and scope

## Scope

The accounting app provides employee contracts, payroll, employee loans, daily cash receipts, the operational ledger, and printable reports. Forms is the only remaining accounting feature confirmed by the owner. Invoice and payment overview routes are leftover placeholders, absent from the sidebar, and are not agreed missing deliverables. The public website's registrar PDF downloads are a separate feature.

## Receipts and ledger

Cash receipts are edited by day in /dashboard/operational/cash-receipts. Saving a day creates or updates its linked Daily Sales Deposit entry in the operational ledger. Deposits are ledger debits (money in); expenses are credits (money out). Short/over is deposit minus receipts.

The schema is packages/db/src/schema/accounting/operational.ts and includes daily_cash_receipts, operational_cash_flow and operational_opening_balances. The ledger balance is calculated rather than stored on every row. A monthly opening-balance override becomes the starting point for subsequent rolling calculations until another override applies.

## Payroll and loans

Generate payroll in a DRAFT period, review its earnings/deductions and make any required adjustments before finalization. Part-time teaching records start with zero classes; enter Classes per Cut-off for the period.

Active loans supply suggested payroll deductions capped by the remaining balance. Paying payroll does not automatically post payments to the loan ledger. Record those payments in Loan Management to reduce the balance. This is the current intentional workflow.

For tests and known integrity defects, consult REPO-AUDIT.md and packages/db/test/RECOVERY_TESTING.md. Completed implementation checklists were removed in favor of this description of current behavior.

Receipt saves use unique daily dates and unique linked ledger entries with transactional upserts (requires migration 0015). Loan payment and payroll calculations use integer cents. Input amounts accept up to two decimal places; generated half salaries round half a cent upward before totals are calculated. Existing finalized payroll records are not recalculated by deployment.
