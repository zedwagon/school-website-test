"use server";

import { z } from "zod";
import { hashPassword } from "../auth/util";
import {
  approveEnrollmentQuery,
  checkStudentIdentityQuery,
  enrollStudentQuery,
  searchStudentsQuery,
  updateEnrollmentStatusQuery,
  updateRegistrarNoteQuery,
} from "./query";

// ============================================================================
// HELPERS
// ============================================================================

function handleDatabaseError(err: unknown, defaultMsg: string) {
  console.error("Database operation failed:", err);

  const dbError = err as { code?: string; originalError?: { code?: string } };
  const code = dbError?.code || dbError?.originalError?.code;

  const errorMap: Record<string, string> = {
    "23505": "This record already exists (e.g., Email or LRN is taken).",
    "23503": "The referenced record (student or school year) was not found.",
    "23502": "Some required information is missing.",
    "22P02": "Invalid data format provided for one or more fields.",
  };

  return { error: code && errorMap[code] ? errorMap[code] : defaultMsg };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const enrollStudentSchema = z.object({
  existingStudentId: z.number().optional(),
  email: z.email().optional(),
  firstName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  lastName: z.string().min(1).optional(),
  suffix: z.string().optional(),
  birthdate: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  lrn: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{12}$/.test(val), {
      message: "LRN must be exactly 12 digits",
    }),
  guardianName: z.string().optional(),
  guardianContact: z.string().optional(),
  fatherName: z.string().optional(),
  motherMaidenName: z.string().optional(),
  psaBirthCertNo: z.string().optional(),
  address: z.string().optional(),
  zipCode: z
    .string()
    .max(10, "Zip code cannot exceed 10 characters")
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "Zip code must be numeric",
    }),
  guardianRelationship: z.string().optional(),
  gradeLevel: z.enum([
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
  ]),
  studentType: z.enum(["new", "transferee", "returning", "old"]),
  learnerType: z.enum(["elementary", "junior_high", "senior_high"]),
  shsTrack: z.enum(["academic", "tech_pro"]).optional(),
  schoolYearId: z.number(),
  lastGradeLevelCompleted: z.string().optional(),
  lastSchoolYearCompleted: z.string().optional(),
  lastSchoolName: z.string().optional(),
  lastSchoolId: z.string().optional(),
  lastSchoolAddress: z.string().optional(),
  isEsc: z.boolean().optional(),
  escNumber: z.string().optional(),
  isShsVoucher: z.boolean().optional(),
});

// ============================================================================
// ENROLLMENT MUTATION ACTIONS
// ============================================================================

/**
 * Approves an enrollment form
 */
export async function approveEnrollment(formId: number, notes?: string) {
  try {
    // Note: session check is handled inside query
    await approveEnrollmentQuery(formId, notes);
    return { success: true };
  } catch (err: unknown) {
    return handleDatabaseError(
      err,
      "An unexpected error occurred while approving enrollment. Please try again."
    );
  }
}

/**
 * Updates registrar notes for an enrollment form
 */
export async function updateRegistrarNote(
  enrollmentId: number,
  note: string | null
) {
  try {
    await updateRegistrarNoteQuery(enrollmentId, note);
    return { success: true };
  } catch (err: unknown) {
    return handleDatabaseError(
      err,
      "An unexpected error occurred while updating the note. Please try again."
    );
  }
}

/**
 * Updates enrollment status (dropped, transferred, enrolled)
 */
export async function updateEnrollmentStatus(
  enrollmentId: number,
  status: "dropped" | "transferred" | "enrolled",
  reason?: string
) {
  try {
    const isEnrolled = status === "enrolled";
    const statusNote = reason
      ? `${status.charAt(0).toUpperCase() + status.slice(1)}: ${reason}`
      : status === "enrolled"
        ? null
        : status;

    await updateEnrollmentStatusQuery(enrollmentId, isEnrolled, statusNote);

    return { success: true };
  } catch (err: unknown) {
    return handleDatabaseError(
      err,
      "An unexpected error occurred while updating status. Please try again."
    );
  }
}

/**
 * Searches for an existing student by LRN or by name.
 */
export async function searchStudentByLRN(query: string) {
  try {
    if (!query || query.trim().length < 2) {
      return { data: [] };
    }

    const data = await searchStudentsQuery(query);
    return { data };
  } catch (error) {
    console.error("Search student error:", error);
    return { data: [] };
  }
}

/**
 * Smart Enrollment Wizard backend: Orchestrates User/Student/Form creation
 */
export async function enrollStudentForSY(
  data: z.infer<typeof enrollStudentSchema>
) {
  try {
    const validated = enrollStudentSchema.parse(data);

    let studentId = validated.existingStudentId;
    let newCredentials: { email: string; password: string } | null = null;
    let newUser = undefined;
    let newStudent = undefined;

    if (!studentId) {
      if (
        !(
          validated.email &&
          validated.firstName &&
          validated.lastName &&
          validated.birthdate &&
          validated.gender
        )
      ) {
        return {
          error:
            "Missing required fields for new student: email, firstName, lastName, birthdate, gender",
        };
      }

      const tempPassword = `MPPSI-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
      const hashedPassword = await hashPassword(tempPassword);

      newUser = {
        email: validated.email,
        passwordHash: hashedPassword,
      };

      newStudent = {
        firstName: validated.firstName,
        middleName: validated.middleName,
        lastName: validated.lastName,
        suffix: validated.suffix,
        birthdate: validated.birthdate,
        gender: validated.gender as "male" | "female",
        lrn: validated.lrn,
        fatherName: validated.fatherName,
        motherMaidenName: validated.motherMaidenName,
        psaBirthCertNo: validated.psaBirthCertNo,
        address: validated.address,
        zipCode: validated.zipCode,
      };

      newCredentials = {
        email: validated.email,
        password: tempPassword,
      };
    }

    await enrollStudentQuery({
      studentId,
      newUser,
      newStudent,
      form: {
        schoolYearId: validated.schoolYearId,
        gradeLevel: validated.gradeLevel,
        studentType: validated.studentType,
        learnerType: validated.learnerType,
        shsTrack: validated.shsTrack,
        guardianName: validated.guardianName,
        guardianContact: validated.guardianContact,
        guardianRelationship: validated.guardianRelationship,
        lastGradeLevelCompleted: validated.lastGradeLevelCompleted,
        lastSchoolYearCompleted: validated.lastSchoolYearCompleted,
        lastSchoolName: validated.lastSchoolName,
        lastSchoolId: validated.lastSchoolId,
        lastSchoolAddress: validated.lastSchoolAddress,
        isEsc: validated.isEsc,
        escNumber: validated.escNumber,
        isShsVoucher: validated.isShsVoucher,
      },
    });

    return { success: true, newCredentials };
  } catch (err: unknown) {
    // 1. Handle Known Message Errors (from our pre-checks)
    if (
      err instanceof Error &&
      (err.message.includes("exists") ||
        err.message.includes("already registered") ||
        err.message.includes("already in use"))
    ) {
      return { error: err.message };
    }

    // 2. Handle Postgres/DB specific errors
    return handleDatabaseError(
      err,
      "An unexpected error occurred during enrollment. Please try again or contact support."
    );
  }
}

/**
 * Note: getStudentEnrollmentDetails is now used directly via query.ts
 */
/**
 * Checks student identity uniqueness (Email/LRN)
 */
export async function checkStudentIdentity(email: string, lrn?: string) {
  try {
    const result = await checkStudentIdentityQuery(email, lrn);
    return result;
  } catch (err: unknown) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to check student identity",
    };
  }
}
