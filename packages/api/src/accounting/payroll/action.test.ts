import { db } from "@school/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createEmployee,
	generatePayrollsForPeriod,
	updatePayroll,
} from "./action";

vi.mock("../../auth/guard", () => ({
	validateActionSession: vi.fn().mockResolvedValue({}),
}));

vi.mock("server-only", () => {
	return {};
});

// Mock the db
vi.mock("@school/db", () => {
	const mDb = {
		transaction: vi.fn(),
		for: vi.fn(),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockResolvedValue([{ id: 1 }]),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		innerJoin: vi.fn().mockReturnThis(),
		query: {
			employeeLoans: {
				findMany: vi.fn().mockResolvedValue([]),
			},
		},
	};
	return { db: mDb };
});

describe("Payroll Generation", () => {
	beforeEach(() => {
		vi.resetAllMocks();

		// Re-apply default mock ReturnThis since resetAllMocks clears them!
		(db as any).transaction.mockImplementation(
			(callback: (tx: typeof db) => unknown) => callback(db),
		);
		(db as any).for.mockResolvedValue([{ status: "DRAFT" }]);
		(db as any).select.mockReturnThis();
		(db as any).from.mockReturnThis();
		(db as any).insert.mockReturnThis();
		(db as any).values.mockReturnThis();
		(db as any).returning.mockResolvedValue([{ id: 1 }]);
		(db as any).update.mockReturnThis();
		(db as any).set.mockReturnThis();
		(db as any).where.mockReturnThis();
		(db as any).delete.mockReturnThis();
		(db as any).innerJoin.mockReturnThis();
		(db as any).query.employeeLoans.findMany.mockResolvedValue([]);
	});

	it("should calculate correct net pay for standard employee", async () => {
		const mockContracts = [
			{
				contract: {
					employeeId: 1,
					baseSalary: "15000.00",
					transpoAllowance: "0.00",
					positionPay: "0.00",
					advisoryPay: "0.00",
					holidayPay: "0.00",
					additionalPay: "0.00",
					moderatorPay: "0.00",
					dailySalary: "0.00",
					subjectHoursPerDay: "0.00",
					sssEe: "375.00",
					sssEr: "375.00",
					philhealthEe: "200.00",
					philhealthEr: "200.00",
					pagIbigEe: "2500.00",
					pagIbigEr: "0.00",
				},
				type: "teaching",
			},
		];

		// Note: generatePayrollsForPeriod does db.select().from().where(), so we mock 'where'
		vi.mocked((db as any).where)
			.mockReturnValueOnce(db) // Period locking query resolves through .for()
			.mockResolvedValueOnce([{ id: 1 }]) // Second where: activeEmployees
			.mockResolvedValueOnce(mockContracts as any); // Third where: contractsQuery

		await generatePayrollsForPeriod(1);

		// Verify what was passed to db.insert().values()
		expect((db as any).values).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					employeeId: 1,
					baseSalary: "15000.00",
					halfSalary: "7500.00",
					totalEarnings: "7500.00",
					totalDeductions: "3075.00",
					netPay: "4425.00",
				}),
			]),
		);
	});

	it("clears draft payrolls and returns no records when every employee is inactive", async () => {
		vi.mocked((db as any).where)
			.mockReturnValueOnce(db)
			.mockResolvedValueOnce([]);

		await expect(generatePayrollsForPeriod(1)).resolves.toEqual([]);
		expect((db as any).delete).toHaveBeenCalled();
	});

	it("includes administrator honorarium in earnings and preserves it on later edits", async () => {
		const current = {
			periodId: 1,
			employeeType: "administrators",
			halfSalary: "7500.00",
			honorarium: "0.00",
			sssEe: "375.00",
			loanDeduction: "100.00",
		};
		const mockCurrent = (record: typeof current) => {
			vi.mocked((db as any).where)
				.mockResolvedValueOnce([record])
				.mockReturnValueOnce(db)
				.mockResolvedValueOnce([record]);
		};
		mockCurrent(current);
		await updatePayroll(1, { honorarium: "1200.25" });
		expect((db as any).set).toHaveBeenLastCalledWith(expect.objectContaining({
			honorarium: "1200.25",
			totalEarnings: "8700.25",
			totalDeductions: "475.00",
			netPay: "8225.25",
		}));
		mockCurrent({ ...current, honorarium: "1200.25" });
		await updatePayroll(1, { loanDeduction: "200.00" });
		expect((db as any).set).toHaveBeenLastCalledWith(expect.objectContaining({
			totalEarnings: "8700.25",
			netPay: "8125.25",
		}));
	});

	it.each(["administrators", "teaching", "non_teaching"])("saves leave days without changing pay for %s", async (employeeType) => {
		const current = { periodId: 1, employeeType, halfSalary: "7500.00", sssEe: "375.00", loanDeduction: "100.00", sickLeaveUsed: "0", silUsed: "0" };
		const mockCurrent = (record: typeof current) => vi.mocked((db as any).where).mockResolvedValueOnce([record]).mockReturnValueOnce(db).mockResolvedValueOnce([record]);
		mockCurrent(current);
		await updatePayroll(1, { sickLeaveUsed: "1.5", silUsed: "2" });
		expect((db as any).set).toHaveBeenLastCalledWith(expect.objectContaining({ sickLeaveUsed: "1.5", silUsed: "2", totalEarnings: "7500.00", totalDeductions: "475.00", netPay: "7025.00" }));
		mockCurrent({ ...current, sickLeaveUsed: "1.5", silUsed: "2" });
		await updatePayroll(1, { sickLeaveUsed: "0" });
		expect((db as any).set).toHaveBeenLastCalledWith(expect.objectContaining({ sickLeaveUsed: "0", netPay: "7025.00" }));
		expect((db as any).set.mock.calls.at(-1)[0]).not.toHaveProperty("silUsed");
	});

	it.each([{ sickLeaveUsed: "-1" }, { silUsed: "1.234" }, { silUsed: "100000000" }, { sickLeaveUsed: "abc" }])("rejects invalid leave days %j", async (data) => {
		await expect(updatePayroll(1, data)).rejects.toThrow();
		expect((db as any).set).not.toHaveBeenCalled();
	});

	it("rejects leave usage for part-time teaching", async () => {
		const current = { periodId: 1, employeeType: "part_time_teaching" };
		vi.mocked((db as any).where).mockResolvedValueOnce([current]).mockReturnValueOnce(db).mockResolvedValueOnce([current]);
		await expect(updatePayroll(1, { silUsed: "1" })).rejects.toThrow("Leave usage is not available");
		expect((db as any).set).not.toHaveBeenCalled();
	});

	it("rejects honorarium on a non-administrator payroll", async () => {
		const current = { periodId: 1, employeeType: "teaching" };
		vi.mocked((db as any).where)
			.mockResolvedValueOnce([current])
			.mockReturnValueOnce(db)
			.mockResolvedValueOnce([current]);
		await expect(updatePayroll(1, { honorarium: "100" })).rejects.toThrow("Honorarium is only available for administrators.");
		expect((db as any).set).not.toHaveBeenCalled();
	});

	it("keeps loan deductions when editing a part-time payroll", async () => {
		vi.mocked((db as any).where)
			.mockResolvedValueOnce([
				{
					periodId: 1,
					employeeType: "part_time_teaching",
					numberOfClasses: 2,
					dailySalary: "500",
					loanDeduction: "100",
				},
			])
			.mockReturnValueOnce(db)
			.mockResolvedValueOnce([
				{
					periodId: 1,
					employeeType: "part_time_teaching",
					numberOfClasses: 2,
					dailySalary: "500",
					loanDeduction: "100",
				},
			]);

		await updatePayroll(1, { numberOfClasses: 3 });

		expect((db as any).set).toHaveBeenCalledWith(
			expect.objectContaining({
				totalEarnings: "1500.00",
				totalDeductions: "100.00",
				netPay: "1400.00",
			}),
		);
	});
});

describe("Employee HR Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create an employee", async () => {
		const testEmployee = {
			firstName: "John",
			lastName: "Doe",
			type: "non_teaching" as any,
		};

		vi.mocked((db as any).returning).mockResolvedValueOnce([
			{ id: 2, ...testEmployee },
		]);

		const result = await createEmployee(testEmployee);

		expect((db as any).insert).toHaveBeenCalled();
		expect((db as any).values).toHaveBeenCalledWith(testEmployee);
		expect(result).toHaveProperty("id", 2);
	});
});
