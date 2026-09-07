import { eq } from "drizzle-orm";
import { db } from "@school/db";
import { enrollmentForms, schoolYears, staff, students } from "@school/db";

/**
 * Fetches a single cleared clinic record by enrollmentForm ID.
 * Returns student info + clinic medical history + approver info.
 */
export async function getClinicPrintData(enrollmentFormId: number) {
  const [result] = await db
    .select({
      // Student info
      studentId: students.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      birthdate: students.birthdate,
      gender: students.gender,
      address: students.address,
      lrn: students.lrn,
      fatherName: students.fatherName,
      motherMaidenName: students.motherMaidenName,

      // Enrollment info
      enrollmentFormId: enrollmentForms.id,
      gradeLevel: enrollmentForms.gradeLevel,
      guardianName: enrollmentForms.guardianName,
      guardianContact: enrollmentForms.guardianContact,
      studentType: enrollmentForms.studentType,

      // Clinic-specific data
      statusClinicDone: enrollmentForms.statusClinicDone,
      statusClinicFinishedAt: enrollmentForms.statusClinicFinishedAt,
      statusClinicNote: enrollmentForms.statusClinicNote,
      statusClinicMedicalHistory: enrollmentForms.statusClinicMedicalHistory,

      // Approver info
      approvedByFirstName: staff.firstName,
      approvedByLastName: staff.lastName,

      // School year
      schoolYearName: schoolYears.name,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .leftJoin(staff, eq(enrollmentForms.statusClinicApprovedById, staff.userId))
    .leftJoin(schoolYears, eq(enrollmentForms.schoolYearId, schoolYears.id))
    .where(eq(enrollmentForms.id, enrollmentFormId))
    .limit(1);

  return result ?? null;
}

/**
 * Fetches a single cleared guidance record by enrollmentForm ID.
 * Returns student info + guidance profile + needs + approver info.
 */
export async function getGuidancePrintData(enrollmentFormId: number) {
  const [result] = await db
    .select({
      // Student info
      studentId: students.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      suffix: students.suffix,
      birthdate: students.birthdate,
      gender: students.gender,
      address: students.address,
      lrn: students.lrn,
      fatherName: students.fatherName,
      motherMaidenName: students.motherMaidenName,

      // Enrollment info
      enrollmentFormId: enrollmentForms.id,
      gradeLevel: enrollmentForms.gradeLevel,
      guardianName: enrollmentForms.guardianName,
      guardianContact: enrollmentForms.guardianContact,
      guardianRelationship: enrollmentForms.guardianRelationship,
      studentType: enrollmentForms.studentType,

      // Guidance-specific data
      statusGuidanceDone: enrollmentForms.statusGuidanceDone,
      statusGuidanceFinishedAt: enrollmentForms.statusGuidanceFinishedAt,
      statusGuidanceNote: enrollmentForms.statusGuidanceNote,
      statusGuidanceProfile: enrollmentForms.statusGuidanceProfile,
      statusGuidanceNeeds: enrollmentForms.statusGuidanceNeeds,
      statusGuidanceHasDiagnosis: enrollmentForms.statusGuidanceHasDiagnosis,

      // Approver info
      approvedByFirstName: staff.firstName,
      approvedByLastName: staff.lastName,

      // School year
      schoolYearName: schoolYears.name,
    })
    .from(enrollmentForms)
    .innerJoin(students, eq(enrollmentForms.studentId, students.id))
    .leftJoin(
      staff,
      eq(enrollmentForms.statusGuidanceApprovedById, staff.userId)
    )
    .leftJoin(schoolYears, eq(enrollmentForms.schoolYearId, schoolYears.id))
    .where(eq(enrollmentForms.id, enrollmentFormId))
    .limit(1);

  return result ?? null;
}
