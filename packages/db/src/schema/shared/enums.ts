import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "staff", "admin"]);

export const gradeLevelEnum = pgEnum("grade_level", [
  "nursery",
  "kinder_1",
  "kinder_2",
  "grade_1",
  "grade_2",
  "grade_3",
  "grade_4",
  "grade_5",
  "grade_6",
  "grade_7",
  "grade_8",
  "grade_9",
  "grade_10",
  "grade_11",
  "grade_12",
]);

export const studentTypeEnum = pgEnum("student_type", [
  "new",
  "transferee",
  "returning",
  "old",
]);

// enrollmentStatusEnum deleted - now using isEnrolled (boolean) + statusNote (text)

export const learnerTypeEnum = pgEnum("learner_type", [
  "elementary",
  "junior_high",
  "senior_high",
]);

export const staffDepartmentEnum = pgEnum("staff_department", [
  "registrar",
  "clinic",
  "guidance",
  "accounting",
  "faculty",
  "admin",
  "utility",
]);

export const employeeTypeEnum = pgEnum("employee_type", [
  "part_time_teaching",
  "non_teaching",
  "teaching",
  "administrators",
]);

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const shsTrackEnum = pgEnum("shs_track", ["academic", "tech_pro"]);

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "full_payment",
  "down_payment",
  "insufficient",
  "promissory_note",
]);
