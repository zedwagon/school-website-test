// School Information Constants for MPPSI
export const SCHOOL_INFO = {
  name: "Mother Perpetua Parochial School Inc.",
  acronym: "MPPSI",
  email: "mppsregistrar@gmail.com",
  phone: "042-731-9482",
  address: {
    street: "Gomez Corner, Burgos St.",
    barangay: "Brgy. Lual Poblacion",
    municipality: "Mauban",
    province: "Quezon",
    full: "Gomez Corner, Burgos St. Brgy. Lual Poblacion, Mauban, Quezon",
  },
} as const;

// Student Type Labels (Enrollment Status)
export const STUDENT_TYPE_LABELS = {
  new: "New",
  old: "Old Student",
  transferee: "Transferee",
  returning: "Returning (Balik-Aral)",
} as const;

// Learner Type Labels (Education Level Category)
export const LEARNER_TYPE_LABELS = {
  elementary: "Elementary",
  junior_high: "Junior High School",
  senior_high: "Senior High School",
} as const;

// SHS Track Labels (Strengthened SHS Curriculum - DepEd)
export const SHS_TRACK_LABELS = {
  academic: "Academic Track",
  tech_pro: "Technical Professional (TechPro) Track",
} as const;

// Grade Level Labels
export const GRADE_LEVEL_LABELS = {
  nursery: "Nursery",
  kinder_1: "Kindergarten 1",
  kinder_2: "Kindergarten 2",
  grade_1: "Grade 1",
  grade_2: "Grade 2",
  grade_3: "Grade 3",
  grade_4: "Grade 4",
  grade_5: "Grade 5",
  grade_6: "Grade 6",
  grade_7: "Grade 7",
  grade_8: "Grade 8",
  grade_9: "Grade 9",
  grade_10: "Grade 10",
  grade_11: "Grade 11",
  grade_12: "Grade 12",
} as const;

// Grade levels grouped by level category
export const GRADE_LEVELS_BY_LEARNER_TYPE = {
  elementary: [
    "nursery",
    "kinder_1",
    "kinder_2",
    "grade_1",
    "grade_2",
    "grade_3",
    "grade_4",
    "grade_5",
    "grade_6",
  ],
  junior_high: ["grade_7", "grade_8", "grade_9", "grade_10"],
  senior_high: ["grade_11", "grade_12"],
} as const;

// Day of Week Labels
export const DAY_OF_WEEK_LABELS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
} as const;

// Auth Constants
export const AUTH_COOKIE = {
  NAME: "mppsi_session",
  DURATION_MS: 1000 * 60 * 60 * 24 * 7, // 7 days
} as const;
