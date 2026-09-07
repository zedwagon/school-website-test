"use server";

import { z } from "zod";
import {
  archiveSectionQuery,
  assignStudentToSectionQuery,
  assignSubjectToSectionQuery,
  checkExistingAssignmentQuery,
  checkExistingRosterQuery,
  createSectionQuery,
  getEnrollmentRecordQuery,
  getSectionMetadataQuery,
  removeSectionSubjectQuery,
  restoreSectionQuery,
  restoreSectionSubjectQuery,
  unassignStudentFromSectionQuery,
  updateSectionQuery,
  updateSectionSubjectQuery,
} from "./query";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const sectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
  schoolYearId: z.coerce.number().min(1, "School Year is required"),
  adviserId: z.coerce.number().optional(),
  room: z.string().optional(),
});

const sectionSubjectSchema = z.object({
  sectionId: z.number(),
  subjectId: z.number(),
  teacherId: z.number().nullable().optional(),
  dayOfWeek: z
    .enum(["monday", "tuesday", "wednesday", "thursday", "friday"])
    .nullable()
    .optional(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
});

// ============================================================================
// SECTION CRUD ACTIONS
// ============================================================================

export async function createSection(data: z.infer<typeof sectionSchema>) {
  try {
    const validated = sectionSchema.parse(data);
    await createSectionQuery(validated);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to create section",
    };
  }
}

export async function updateSection(
  id: number,
  data: z.infer<typeof sectionSchema>
) {
  try {
    const validated = sectionSchema.parse(data);
    await updateSectionQuery(id, validated);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to update section",
    };
  }
}

export async function archiveSection(id: number) {
  try {
    await archiveSectionQuery(id);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to archive section",
    };
  }
}

export async function restoreSection(id: number) {
  try {
    await restoreSectionQuery(id);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to restore section",
    };
  }
}

// ============================================================================
// SECTION SCHEDULE / CLASS BUILDER ACTIONS
// ============================================================================

/**
 * Note: getSectionSchedule is now used directly via query.ts
 */

export async function assignSubjectToSection(
  data: z.infer<typeof sectionSubjectSchema>
) {
  try {
    const validated = sectionSubjectSchema.parse(data);

    const existing = await checkExistingAssignmentQuery(
      validated.sectionId,
      validated.subjectId
    );

    if (existing) {
      return { error: "This subject is already assigned to this section" };
    }

    await assignSubjectToSectionQuery(validated);

    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to assign subject",
    };
  }
}

export async function updateSectionSubject(
  id: number,
  data: Partial<z.infer<typeof sectionSubjectSchema>>
) {
  try {
    const updateData: Record<string, string | number | null> = {};

    if (data.teacherId !== undefined) {
      updateData.teacherId = data.teacherId;
    }
    if (data.dayOfWeek !== undefined) {
      updateData.dayOfWeek = data.dayOfWeek;
    }
    if (data.startTime !== undefined) {
      updateData.startTime = data.startTime;
    }
    if (data.endTime !== undefined) {
      updateData.endTime = data.endTime;
    }

    await updateSectionSubjectQuery(id, updateData);

    return { success: true };
  } catch (err: unknown) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to update subject assignment",
    };
  }
}

export async function removeSectionSubject(id: number) {
  try {
    await removeSectionSubjectQuery(id);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to remove subject",
    };
  }
}

export async function restoreSectionSubject(id: number) {
  try {
    await restoreSectionSubjectQuery(id);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to restore subject",
    };
  }
}

// ============================================================================
// STUDENT-SECTION ASSIGNMENT ACTIONS
// ============================================================================

export async function assignStudentToSection(
  enrollmentId: number,
  sectionId: number
) {
  try {
    // Note: session check is handled inside queries called below
    const enrollment = await getEnrollmentRecordQuery(enrollmentId);

    if (!enrollment) {
      return { error: "Enrollment record not found" };
    }
    if (!enrollment.isEnrolled) {
      return {
        error: "Student must be fully enrolled before section assignment",
      };
    }

    const existingRoster = await checkExistingRosterQuery(enrollmentId);

    if (existingRoster) {
      return {
        error: "Student is already assigned to a section for this enrollment",
      };
    }

    const section = await getSectionMetadataQuery(sectionId);

    if (!section) {
      return { error: "Section not found" };
    }

    if (section.schoolYearId !== enrollment.schoolYearId) {
      return {
        error: "Section school year does not match enrollment school year",
      };
    }

    if (section.gradeLevel !== enrollment.gradeLevel) {
      return {
        error: `Section grade level (${section.gradeLevel}) does not match student grade level (${enrollment.gradeLevel})`,
      };
    }

    await assignStudentToSectionQuery({ enrollmentId, sectionId });

    return { success: true };
  } catch (error) {
    console.error("Assign student to section error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to assign section",
    };
  }
}

export async function unassignStudentFromSection(
  enrollmentId: number,
  sectionId: number
) {
  try {
    await unassignStudentFromSectionQuery(enrollmentId, sectionId);
    return { success: true };
  } catch (error) {
    console.error("Unassign student error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to unassign student",
    };
  }
}
