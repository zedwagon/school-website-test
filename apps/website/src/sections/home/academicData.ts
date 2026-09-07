export type AcademicSlug = "elementary" | "junior-high" | "senior-high";

export interface ProgramSubGroup {
  label: string;
  subItems: string[];
}

export interface ProgramItem {
  items?: (string | ProgramSubGroup)[];
  title: string;
}

export interface AcademicPageContent {
  description: string;
  events: { name: string; date: string }[];
  programs: ProgramItem[];
  title: string;
}

export const academicPages: Record<AcademicSlug, AcademicPageContent> = {
  elementary: {
    title: "Elementary School",
    description:
      "The Elementary Program nurtures young minds through a balanced curriculum that promotes academic excellence, character development, and social responsibility.",
    programs: [
      {
        title: "1. Core Subjects",
        items: [
          "Mathematics",
          "Science",
          "English",
          "Araling Panlipunan",
          "Filipino",
        ],
      },
      {
        title: "2. Non-Core Subjects",
        items: [
          {
            label: "MAPEH",
            subItems: ["Music", "Arts", "Physical Education", "Health"],
          },
          "Values Education",
          "GMRC (Good Manners and Right Conduct)",
        ],
      },
      {
        title: "3. Faith Formation",
        items: ["Basic Catechism", "Prayer and Worship Experience"],
      },
      {
        title: "4. Learning Progression",
        items: [
          "Reading and Writing Skills",
          "Numeracy Skills",
          "Communication Skills",
          "Practical Life Skills",
        ],
      },
    ],
    events: [
      { name: "Intramurals", date: "August 15, 2025" },
      { name: "Field Trip to Science Center", date: "October 12, 2025" },
      { name: "School Retreat", date: "December 5, 2025" },
    ],
  },
  "junior-high": {
    title: "Junior Highschool",
    description:
      "Junior Highschool prepares students for senior high through a comprehensive curriculum that strengthens critical thinking, leadership, and creativity.",
    programs: [
      {
        title: "1. Enriched Core Academics",
        items: [
          "Advanced Mathematics",
          "Investigative Science",
          "Functional English & Filipino",
          "Integrative Araling Panlipunan",
        ],
      },
      {
        title: "2. Holistic Leadership & Student Engagement",
        items: [
          "Student-Led Clubs & Organizations",
          "Co-Curricular & Civic Engagement",
        ],
      },
      {
        title: "3. Character Development & Action",
        items: ["Active Stewardship", "Value Integration"],
      },
      {
        title: "4. Specialized Talents & Skill Progression",
        items: [
          "Expressive Arts (Music & Dance)",
          "Campus Journalism & Media Literacy",
          "Speech and Oral Communication",
          "Athletic Development & Sportsmanship",
        ],
      },
    ],
    events: [
      { name: "Science Fair", date: "September 20, 2025" },
      { name: "Debate Competition", date: "November 3, 2025" },
      { name: "Community Outreach", date: "January 15, 2026" },
    ],
  },
  "senior-high": {
    title: "Senior Highschool",
    description:
      "Senior High equips students with specialized academic clusters that prepare them for college, university, or career paths, fostering independent thinking and future readiness.",
    programs: [
      {
        title: "1. Future Ready Pathways: Specialized Clusters",
        items: [
          "Arts, Social Sciences & Humanities (ASSH)",
          "Business & Entrepreneurship (BE)",
          "Science, Technology, Engineering & Mathematics (STEM)",
          "Sports, Health & Wellness (SHW)",
        ],
      },
      {
        title: "2. Beyond the Classroom: Immersive Experiences",
        items: [
          "Industry Immersion & Mentorship Programs",
          "Capstone Initiative & Innovation",
        ],
      },
      {
        title: "3. Holistic Development: The Institutional Edge",
        items: [
          "Values-Driven Leadership",
          "Civic Engagement & Community Impact",
        ],
      },
      {
        title: "4. SHS Exclusive Offer",
        items: ["Religious Education"],
      },
    ],
    events: [
      { name: "Career Orientation", date: "July 10, 2025" },
      { name: "Research Symposium", date: "October 18, 2025" },
      { name: "Graduation", date: "March 25, 2026" },
    ],
  },
};
