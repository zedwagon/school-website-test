import { db } from "./packages/db/src/index";
import { payrollPeriods } from "./packages/db/src/schema/accounting/payroll";

async function main() {
  const records = await db.select().from(payrollPeriods);
  console.log(records);
}

main().catch(console.error);
