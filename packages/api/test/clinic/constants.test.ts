import { describe, it, expect } from "vitest";
import { MEDICAL_HISTORY_QUESTIONS } from "../../src/clinic/constants";

describe("Clinic Constants", () => {
  it("should contain a valid array of medical history questions", () => {
    expect(Array.isArray(MEDICAL_HISTORY_QUESTIONS)).toBe(true);
    expect(MEDICAL_HISTORY_QUESTIONS.length).toBeGreaterThan(0);
  });

  it("should have valid shape for all questions", () => {
    MEDICAL_HISTORY_QUESTIONS.forEach(question => {
      expect(question).toHaveProperty("id");
      expect(question).toHaveProperty("text");
      expect(question).toHaveProperty("category");
      expect(typeof question.id).toBe("number");
      expect(typeof question.text).toBe("string");
      expect(typeof question.category).toBe("string");
    });
  });

  it("should not have duplicate IDs", () => {
    const ids = MEDICAL_HISTORY_QUESTIONS.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
