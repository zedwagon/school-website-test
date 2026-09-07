import { describe, it, expect } from "vitest";
import { 
  CIVIL_STATUS_OPTIONS,
  OCCUPATION_TYPE_OPTIONS,
  INCOME_BRACKET_OPTIONS,
  EDUCATIONAL_ATTAINMENT_OPTIONS,
  SPECIAL_NEEDS_CATEGORIES 
} from "../../src/guidance/constants";

describe("Guidance Constants", () => {
  it("should have valid shape for basic options arrays", () => {
    const optionArrays = [
      CIVIL_STATUS_OPTIONS,
      OCCUPATION_TYPE_OPTIONS,
      INCOME_BRACKET_OPTIONS,
      EDUCATIONAL_ATTAINMENT_OPTIONS,
    ];

    optionArrays.forEach(options => {
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
      options.forEach(opt => {
        expect(opt).toHaveProperty("value");
        expect(opt).toHaveProperty("label");
      });
    });
  });

  it("should have valid shape for SPECIAL_NEEDS_CATEGORIES", () => {
    expect(Array.isArray(SPECIAL_NEEDS_CATEGORIES)).toBe(true);
    expect(SPECIAL_NEEDS_CATEGORIES.length).toBeGreaterThan(0);

    SPECIAL_NEEDS_CATEGORIES.forEach(category => {
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("title");
      expect(category).toHaveProperty("items");
      expect(Array.isArray(category.items)).toBe(true);

      category.items.forEach(item => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("label");
      });
    });
  });
});
