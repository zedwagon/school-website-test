import * as schema from "@school/db/schema";
import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { archiveTeacherQuery, restoreTeacherQuery, updateTeacherQuery } from "./query";
import { getSession } from "../auth/session";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ transaction: vi.fn(), select: vi.fn(), update: vi.fn(), where: vi.fn(), lock: vi.fn() }));
vi.mock("@school/db", () => ({ ...schema, db: mocks }));
vi.mock("../auth/session", () => ({ getSession: vi.fn() }));
const data = { userId: 10, email: "teacher@example.com", firstName: "A", lastName: "B" };
const calls = [
 ["update", () => updateTeacherQuery(1, data)],
 ["archive", () => archiveTeacherQuery(1, 10)],
 ["restore", () => restoreTeacherQuery(1, 10)],
] as const;
beforeEach(() => {
 vi.clearAllMocks();
 vi.mocked(getSession).mockResolvedValue({ user: { role: "staff", staffDepartment: "registrar" } } as never);
 const chain = { from: vi.fn().mockReturnThis(), innerJoin: vi.fn().mockReturnThis(), where: mocks.where, for: mocks.lock };
 mocks.where.mockReturnValue(chain);
 mocks.select.mockReturnValue(chain);
 mocks.transaction.mockImplementation((fn) => fn(mocks));
 mocks.lock.mockResolvedValue([]);
 mocks.update.mockReturnValue({ set: () => ({ where: vi.fn().mockResolvedValue(undefined) }) });
});
describe("teacher mutation targets", () => {
 it.each(calls)("%s rejects non-teacher targets without writes", async (_, call) => {
  await expect(call()).rejects.toThrow("Teacher not found");
  expect(mocks.update).not.toHaveBeenCalled();
  const query = new PgDialect().sqlToQuery(mocks.where.mock.calls[0][0]);
  expect(query.sql).toContain('"users"."role" =');
  expect(query.sql).toContain('"staff"."department" =');
  expect(query.sql).toContain('"staff"."department" is null');
  expect(query.params).toEqual([1, "staff", "faculty"]);
 });
 it.each(calls)("%s rejects mismatched linked user IDs", async (_, call) => {
  mocks.lock.mockResolvedValue([{ userId: 99 }]);
  await expect(call()).rejects.toThrow("Teacher not found");
  expect(mocks.update).not.toHaveBeenCalled();
 });
 it.each(calls)("%s updates eligible teachers", async (_, call) => {
  mocks.lock.mockResolvedValue([{ userId: 10 }]);
  await call();
  expect(mocks.update).toHaveBeenCalledTimes(2);
  expect(mocks.lock).toHaveBeenCalledWith("update");
 });
 it.each(calls)("%s rejects unauthorized callers before transaction", async (_, call) => {
  vi.mocked(getSession).mockResolvedValue({ user: { role: "staff", staffDepartment: "accounting" } } as never);
  await expect(call()).rejects.toThrow("Forbidden");
  expect(mocks.transaction).not.toHaveBeenCalled();
 });
});
