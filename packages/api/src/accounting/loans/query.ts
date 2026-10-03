import "server-only";
import { db } from "@school/db";
import { employeeLoans, employeeLoanPayments, } from "@school/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getEmployeeLoans() {
	return await db.query.employeeLoans.findMany({
		orderBy: [desc(employeeLoans.createdAt)],
		with: {
			employee: true,
			payments: true,
		},
	});
}

export async function getEmployeeLoanById(loanId: number) {
	return await db.query.employeeLoans.findFirst({
		where: eq(employeeLoans.id, loanId),
		with: {
			employee: true,
			payments: {
				orderBy: [desc(employeeLoanPayments.datePaid)],
			},
		},
	});
}
