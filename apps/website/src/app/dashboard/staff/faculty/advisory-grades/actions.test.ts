import * as schema from "@school/db/schema";
import { beforeEach, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { validateActionSession } from "@school/api/auth/guard";
import { saveAdvisoryGrades, type GradeInput } from "./actions";
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@school/api/auth/guard", () => ({ validateActionSession: vi.fn() }));
const mocks = vi.hoisted(() => ({
 transaction: vi.fn(), select: vi.fn(), lock: vi.fn(), where: vi.fn(),
 staff: vi.fn(), schedules: vi.fn(), existing: vi.fn(),
 insert: vi.fn(), update: vi.fn(), delete: vi.fn(), values: vi.fn(),
 set: vi.fn(), write: vi.fn(), committed: [] as unknown[],
}));
vi.mock("@school/db", () => ({ ...schema, db: { transaction: mocks.transaction } }));
const valid: GradeInput = { studentId: 1, subjectId: 2, grade: "90", isGeneralAverage: false };
beforeEach(() => {
 vi.resetAllMocks();
 mocks.committed = [];
 vi.mocked(validateActionSession).mockResolvedValue({ user: { id: 10, role: "staff" } } as never);
 mocks.staff.mockResolvedValue({ id: 20 });
 mocks.lock.mockResolvedValue([{ id: 30, adviserId: 20, schoolYearId: 40 }]);
 mocks.schedules.mockResolvedValue([{ subjectId: 2 }]);
 mocks.existing.mockResolvedValue(undefined);
 const chain = { from: vi.fn().mockReturnThis(), innerJoin: vi.fn().mockReturnThis(), where: mocks.where, for: mocks.lock };
 mocks.select.mockReturnValue(chain);
 mocks.where.mockReturnValueOnce(chain).mockResolvedValue([{ studentId: 1 }]);
 mocks.values.mockResolvedValue(undefined);
 mocks.write.mockResolvedValue(undefined);
 mocks.insert.mockReturnValue({ values: mocks.values });
 mocks.update.mockReturnValue({ set: mocks.set });
 mocks.set.mockReturnValue({ where: mocks.write });
 mocks.delete.mockReturnValue({ where: mocks.write });
 mocks.transaction.mockImplementation(async (callback) => {
  const result = await callback({ select: mocks.select, query: { staff: { findFirst: mocks.staff }, classSchedules: { findMany: mocks.schedules }, grades: { findFirst: mocks.existing } }, insert: mocks.insert, update: mocks.update, delete: mocks.delete });
  mocks.committed = [...mocks.values.mock.calls];
  return result;
 });
});
const noWrites = () => {
 expect(mocks.insert).not.toHaveBeenCalled();
 expect(mocks.update).not.toHaveBeenCalled();
 expect(mocks.delete).not.toHaveBeenCalled();
 expect(revalidatePath).not.toHaveBeenCalled();
};
it("rejects unauthorized sessions before entering a transaction", async () => {
 vi.mocked(validateActionSession).mockRejectedValue(new Error("Forbidden"));
 await expect(saveAdvisoryGrades(30, 40, [valid])).rejects.toThrow("Forbidden");
 expect(mocks.transaction).not.toHaveBeenCalled();
});
it("rejects a different adviser", async () => {
 mocks.lock.mockResolvedValue([{ adviserId: 999, schoolYearId: 40 }]);
 await expect(saveAdvisoryGrades(30, 40, [valid])).rejects.toThrow("not the adviser");
 noWrites();
});
it("rejects a mismatched school year", async () => {
 await expect(saveAdvisoryGrades(30, 99, [valid])).rejects.toThrow("School year");
 noWrites();
});
it("rejects missing or archived sections", async () => {
 mocks.lock.mockResolvedValue([]);
 await expect(saveAdvisoryGrades(30, 40, [valid])).rejects.toThrow("Section not found");
 noWrites();
});
it("validates all students before writing the first valid grade", async () => {
 await expect(saveAdvisoryGrades(30, 40, [valid, { ...valid, studentId: 999 }])).rejects.toThrow("active roster");
 noWrites();
});
it("rejects archived or unassigned subjects", async () => {
 mocks.schedules.mockResolvedValue([]);
 await expect(saveAdvisoryGrades(30, 40, [valid])).rejects.toThrow("Subject is not assigned");
 noWrites();
});
it("requires roster membership even for admins", async () => {
 vi.mocked(validateActionSession).mockResolvedValue({ user: { id: 10, role: "admin" } } as never);
 await expect(saveAdvisoryGrades(30, 40, [{ ...valid, studentId: 999 }])).rejects.toThrow("active roster");
 noWrites();
});
it.each(["NaN", "90junk", "101", "-1", "90.123", ".", "Infinity"])("rejects invalid grade %s before writes", async (grade) => {
 await expect(saveAdvisoryGrades(30, 40, [valid, { ...valid, studentId: 3, grade }])).rejects.toThrow();
 expect(mocks.transaction).not.toHaveBeenCalled();
 noWrites();
});
it.each([
 { ...valid, subjectId: null }, { ...valid, isGeneralAverage: true },
])("rejects inconsistent subject/average identity %j", async (item) => {
 await expect(saveAdvisoryGrades(30, 40, [item])).rejects.toThrow();
 noWrites();
});
it("rejects duplicate cells in a batch", async () => {
 await expect(saveAdvisoryGrades(30, 40, [valid, valid])).rejects.toThrow("Duplicate");
 noWrites();
});
it("saves subject and general-average grades together", async () => {
 expect(await saveAdvisoryGrades(30, 40, [valid, { ...valid, subjectId: null, isGeneralAverage: true }])).toEqual({ success: true });
 expect(mocks.values).toHaveBeenCalledTimes(2);
 expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ grade: "90.00", encodedById: 10, sectionId: 30, schoolYearId: 40 }));
 expect(mocks.lock).toHaveBeenCalledWith("update");
 expect(mocks.committed).toHaveLength(2);
 expect(revalidatePath).toHaveBeenCalledOnce();
});
it("updates existing grades inside the transaction", async () => {
 mocks.existing.mockResolvedValue({ id: 70 });
 await saveAdvisoryGrades(30, 40, [valid]);
 expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ grade: "90.00" }));
 expect(mocks.insert).not.toHaveBeenCalled();
});
it("clears subject and general-average cells atomically", async () => {
 mocks.existing.mockResolvedValue({ id: 70 });
 await saveAdvisoryGrades(30, 40, [{ ...valid, grade: "" }, { ...valid, subjectId: null, isGeneralAverage: true, grade: "" }]);
 expect(mocks.delete).toHaveBeenCalledTimes(2);
 expect(mocks.insert).not.toHaveBeenCalled();
});
it("does not commit or invalidate caches when a later database write fails", async () => {
 mocks.values.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("write failed"));
 await expect(saveAdvisoryGrades(30, 40, [valid, { ...valid, subjectId: null, isGeneralAverage: true }])).rejects.toThrow("write failed");
 expect(mocks.committed).toHaveLength(0);
 expect(revalidatePath).not.toHaveBeenCalled();
});
