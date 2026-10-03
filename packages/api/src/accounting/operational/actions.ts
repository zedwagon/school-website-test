"use server";

import { validateActionSession } from "../../auth/guard";

import { db } from "@school/db";
import { dailyCashReceipts, operationalCashFlow, operationalOpeningBalances } from "@school/db/schema";
import { revalidatePath } from "next/cache";
import { saveDailyCashReceiptSchema, saveOpeningBalanceOverrideSchema, saveLedgerEntrySchema } from "../validations";
import { z } from "zod";

async function upsertDailyCashReceipt(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	entry: z.infer<typeof saveDailyCashReceiptSchema>,
) {
	const { dateString, receipts, deposit } = entry;
	const [receipt] = await tx.insert(dailyCashReceipts)
		.values({ date: dateString, receipts, deposit })
		.onConflictDoUpdate({ target: dailyCashReceipts.date, set: { receipts, deposit } })
		.returning({ id: dailyCashReceipts.id });
	await tx.insert(operationalCashFlow).values({
		date: dateString, particulars: "Daily Sales Deposit", debit: deposit,
		credit: "0", receiptId: receipt.id,
	}).onConflictDoUpdate({
		target: operationalCashFlow.receiptId,
		set: { debit: deposit, credit: "0", date: dateString },
	});
}

export async function saveBulkDailyCashReceipts(entries: { dateString: string; receipts: string; deposit: string }[]) {
	await validateActionSession(["admin", "staff"], "accounting");
	const parsed = z.array(saveDailyCashReceiptSchema).safeParse(entries);
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message || "Invalid bulk entries");
	}
	// Use a consistent lock order across overlapping bulk saves. Last entry for
	// a repeated date wins, matching the former sequential save behavior.
	const byDate = new Map(parsed.data.map((entry) => [entry.dateString, entry]));
	const ordered = [...byDate.values()].sort((a, b) => a.dateString.localeCompare(b.dateString));
	await db.transaction(async (tx) => {
		for (const entry of ordered) await upsertDailyCashReceipt(tx, entry);
	});
	revalidatePath("/dashboard/operational/cash-receipts");
	revalidatePath("/dashboard/operational/ledger");
}

export async function saveDailyCashReceipt(dateString: string, receipts: string, deposit: string) {
	await validateActionSession(["admin", "staff"], "accounting");
	const parsed = saveDailyCashReceiptSchema.safeParse({ dateString, receipts, deposit });
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message || "Invalid cash receipt data");
	}
	await db.transaction(async (tx) => upsertDailyCashReceipt(tx, parsed.data));
	revalidatePath("/dashboard/operational/cash-receipts");
	revalidatePath("/dashboard/operational/ledger");
}

export async function saveOpeningBalanceOverride(year: number, month: number, balance: string) {
	await validateActionSession(["admin", "staff"], "accounting");
	const parsed = saveOpeningBalanceOverrideSchema.safeParse({ year, month, balance });
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message || "Invalid opening balance");
	}
	({ year, month, balance } = parsed.data);
	const monthYear = `${year}-${String(month).padStart(2, '0')}`;
	
	await db.insert(operationalOpeningBalances)
		.values({ monthYear, balance })
		.onConflictDoUpdate({
			target: operationalOpeningBalances.monthYear,
			set: { balance },
		});

	revalidatePath("/dashboard/operational/ledger");
}

export async function saveLedgerEntry(dateStr: string, particulars: string, debit: string, credit: string) {
	await validateActionSession(["admin", "staff"], "accounting");
	const parsed = saveLedgerEntrySchema.safeParse({ 
		dateStr, 
		particulars, 
		debit: debit === "" ? undefined : debit, 
		credit: credit === "" ? undefined : credit 
	});
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message || "Invalid ledger entry data");
	}

	await db.insert(operationalCashFlow).values({
		date: parsed.data.dateStr,
		particulars: parsed.data.particulars,
		debit: parsed.data.debit || "0",
		credit: parsed.data.credit || "0",
	});

	revalidatePath("/dashboard/operational/ledger");
}

