"use server";

import { z } from "zod";
import {
  archiveSubjectQuery,
  createSubjectQuery,
  restoreSubjectQuery,
  updateSubjectQuery,
} from "./query";

const subjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
});

export async function createSubject(data: z.infer<typeof subjectSchema>) {
  try {
    const validated = subjectSchema.parse(data);

    await createSubjectQuery({
      name: validated.name,
      code: validated.code,
      description: validated.description,
    });

    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to create subject",
    };
  }
}

export async function updateSubject(
  id: number,
  data: z.infer<typeof subjectSchema>
) {
  try {
    const validated = subjectSchema.parse(data);

    await updateSubjectQuery(id, {
      name: validated.name,
      code: validated.code,
      description: validated.description,
    });

    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to update subject",
    };
  }
}

export async function archiveSubject(id: number) {
  try {
    await archiveSubjectQuery(id);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to archive subject",
    };
  }
}

export async function restoreSubject(id: number) {
  try {
    await restoreSubjectQuery(id);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to restore subject",
    };
  }
}
