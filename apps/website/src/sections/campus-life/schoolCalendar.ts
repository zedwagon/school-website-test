// data.ts
export interface CalendarRow {
  event: string;
  firstSem: string;
  secondSem: string;
}

export interface CalendarCategory {
  items: CalendarRow[];
  title: string;
}

export const calendarCategories: CalendarCategory[] = [
  {
    title: "Admission & Enrollment",
    items: [
      {
        event: "Nursery, Kindergarten 1 & 2",
        firstSem: "May 14, 2026",
        secondSem: "-",
      },
      {
        event: "Grade 1-6",
        firstSem: "May 15, 2026",
        secondSem: "-",
      },
      {
        event: "Grade 7 & 11",
        firstSem: "May 25, 2026",
        secondSem: "-",
      },
      {
        event: "Grade 8-10 & 12",
        firstSem: "May 26, 2026",
        secondSem: "-",
      },
      {
        event: "Late Enrollees",
        firstSem: "June 1-5, 2026",
        secondSem: "-",
      },
    ],
  },
  {
    title: "Holidays & Breaks",
    items: [
      { event: "Town Fiesta", firstSem: "July 15, 2025", secondSem: "-" },
      {
        event: "Special Non-Working Holiday",
        firstSem: "Oct 31, 2025",
        secondSem: "-",
      },
      { event: "Quezon Day", firstSem: "Aug 19, 2025", secondSem: "-" },
      { event: "Ninoy Aquino Day", firstSem: "Aug 21, 2025", secondSem: "-" },
      {
        event: "National Heroes’ Day",
        firstSem: "Aug 25, 2025",
        secondSem: "-",
      },
      { event: "Academic Break", firstSem: "-", secondSem: "Oct 27-31, 2025" },
      { event: "Hermano Pule", firstSem: "Nov 4, 2025", secondSem: "-" },
      {
        event: "Feast of the Immaculate Conception",
        firstSem: "Dec 8, 2025",
        secondSem: "-",
      },
      {
        event: "Christmas Break",
        firstSem: "-",
        secondSem: "Dec 20, 2025 – Jan 4, 2026",
      },
      { event: "Chinese New Year", firstSem: "Feb 18, 2026", secondSem: "-" },
      { event: "Edsa Day", firstSem: "Feb 25, 2026", secondSem: "-" },
    ],
  },
  {
    title: "School Calendar",
    items: [
      {
        event: "Admission & Enrollment",
        firstSem: "May 14 - June 5, 2026",
        secondSem: "-",
      },
      {
        event: "Brigada Eskwela",
        firstSem: "June 1-5, 2026", // Brigada Eskwela usually aligns with enrollment/late enrollees week
        secondSem: "-",
      },
      {
        event: "First Day of Regular Classes",
        firstSem: "June 8, 2026",
        secondSem: "-",
      },
      {
        event: "1st Quarterly Examination",
        firstSem: "Aug 20 & 22, 2025",
        secondSem: "-",
      },
      {
        event: "2nd Quarterly Examination",
        firstSem: "Oct 23-24, 2025",
        secondSem: "-",
      },
      {
        event: "3rd Quarterly Examination",
        firstSem: "-",
        secondSem: "Jan 22-23, 2026",
      },
      {
        event: "4th Quarterly Examination",
        firstSem: "-",
        secondSem: "Mar 19-20, 2026",
      },
      {
        event: "End of the School Year Rites",
        firstSem: "-",
        secondSem: "Mar 30-31, 2026",
      },
    ],
  },
];
