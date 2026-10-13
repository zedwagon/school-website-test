import * as schema from "@school/db/schema";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as actions from "./action";
import * as queries from "./query";

const mocks = vi.hoisted(() => ({ select: vi.fn(), insert: vi.fn(), update: vi.fn() }));
vi.mock("@school/db", () => ({ ...schema, db: mocks }));
vi.mock("../auth/session", () => ({ getSession: vi.fn() }));
import { getSession } from "../auth/session";

const mutations = [
 ["createSection", [{ name: "A", gradeLevel: "grade_1", schoolYearId: 1 }]],
 ["updateSection", [1, { name: "A", gradeLevel: "grade_1", schoolYearId: 1 }]],
 ["archiveSection", [1]], ["restoreSection", [1]],
 ["assignSubjectToSection", [{ sectionId: 1, subjectId: 1 }]],
 ["updateSectionSubject", [1, {}]], ["removeSectionSubject", [1]],
 ["restoreSectionSubject", [1]], ["assignStudentToSection", [1, 1]],
 ["unassignStudentFromSection", [1, 1]],
] as const;
const queryCalls = [
 ["createSectionQuery", [{ name: "A", gradeLevel: "grade_1", schoolYearId: 1 }]],
 ["updateSectionQuery", [1, {}]], ["archiveSectionQuery", [1]],
 ["restoreSectionQuery", [1]], ["assignSubjectToSectionQuery", [{}]],
 ["updateSectionSubjectQuery", [1, {}]], ["removeSectionSubjectQuery", [1]],
 ["restoreSectionSubjectQuery", [1]], ["assignStudentToSectionQuery", [{}]],
 ["unassignStudentFromSectionQuery", [1, 1]],
 ["checkExistingAssignmentQuery", [1, 1]], ["getEnrollmentRecordQuery", [1]],
 ["checkExistingRosterQuery", [1]], ["getSectionMetadataQuery", [1]],
] as const;
const invoke = (module: object, name: string, args: readonly unknown[]) =>
 (module as Record<string, (...args: unknown[]) => Promise<unknown>>)[name](...args);

beforeEach(() => vi.clearAllMocks());
describe.each([
 ["anonymous", null],
 ["student", { user: { role: "student" } }],
 ["accounting", { user: { role: "staff", staffDepartment: "accounting" } }],
])("section access denied for %s", (_, session) => {
 beforeEach(() => vi.mocked(getSession).mockResolvedValue(session as never));
 it.each(mutations)("blocks action %s before database access", async (name, args) => {
  expect(await invoke(actions, name, args)).toHaveProperty("error");
  expect(mocks.select).not.toHaveBeenCalled();
  expect(mocks.insert).not.toHaveBeenCalled();
  expect(mocks.update).not.toHaveBeenCalled();
 });
 it.each(queryCalls)("blocks direct query %s before database access", async (name, args) => {
  await expect(invoke(queries, name, args)).rejects.toThrow(/Unauthorized|Forbidden/);
  expect(mocks.select).not.toHaveBeenCalled();
  expect(mocks.insert).not.toHaveBeenCalled();
  expect(mocks.update).not.toHaveBeenCalled();
 });
});
it.each(["admin", "registrar"])("allows %s to create a section", async (role) => {
 vi.mocked(getSession).mockResolvedValue({ user: { role: role === "admin" ? "admin" : "staff", staffDepartment: "registrar" } } as never);
 const values = vi.fn().mockResolvedValue(undefined);
 mocks.insert.mockReturnValue({ values });
 expect(await actions.createSection({ name: "A", gradeLevel: "grade_1", schoolYearId: 1 })).toEqual({ success: true });
 expect(values).toHaveBeenCalledWith(expect.objectContaining({ name: "A" }));
});
