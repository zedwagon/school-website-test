"use server";

import { contacts, db } from "@school/db";
import { z } from "zod";

export interface ContactActionState {
  messages?: string[];
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

// Zod schema for validation
const contactFormSchema = z.object({
  name: z.string().min(1, "Please enter your full name."),
  email: z.email("Please enter a valid email address."),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message:
        "Phone number can only contain digits. Do not include spaces, dashes, or letters.",
    }),
  subject: z.string().min(1, "Please provide a subject for your message."),
  message: z.string().min(1, "Please type your message."),
});

export const submitContact = async (
  _: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> => {
  try {
    // Validate input
    const validatedData = contactFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    });

    // Insert into DB
    await db.insert(contacts).values(validatedData);

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((issue) => issue.message);
      return { status: "invalid_data", messages };
    }

    console.error("Submit contact failed:", error);
    return {
      status: "failed",
      messages: ["Something went wrong. Please try again."],
    };
  }
};
