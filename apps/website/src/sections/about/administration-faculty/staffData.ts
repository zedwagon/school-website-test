import { getStaffImagePath } from "@/lib/utils";

export interface Person {
  extraRoles?: string[];
  id: string;
  image: string;
  name: string;
  role: string;
}

export interface FacultyGroup {
  earlyAdviser: Person[];
  elementary: Person[];
  juniorAdviser: Person[];
  seniorAdviser: Person[];
  subjectTeachers: Person[];
}

export interface AdminData {
  assistant: Person;
  head: Person;
  members: Person[];
}

// Tuples: [name, role, filename?, extraRoles?]
const adminDataTuples: [string, string, string?, string[]?][] = [
  [
    "Rev. Fr. Roderick G. Mercurio, LPT, MMEM, FRIEdr",
    "MPPSI Director/Principal",
    "/school-director.webp",
  ],
  [
    "Mr. Aldrich O. Curia, LPT",
    "Assistant Principal",
    "mr-curia",
    ["Alumni Coordinator"],
  ],
  ["Rev. Fr. Librado M. Burgos", "School Chaplain", "fr-librado"],
  ["Mrs. Quezaroany B. Rivera", "Finance Officer", "mrs-rivera"],
];

// Split head, assistant, and members
const [headTuple, assistantTuple, ...memberTuples] = adminDataTuples;

export const adminData: AdminData = {
  head: {
    id: "admin-1",
    name: headTuple[0],
    role: headTuple[1],
    extraRoles: headTuple[3],
    image: headTuple[2]?.startsWith("/")
      ? headTuple[2]
      : getStaffImagePath(headTuple[2] ?? headTuple[0]),
  },
  assistant: {
    id: "admin-2",
    name: assistantTuple[0],
    role: assistantTuple[1],
    extraRoles: assistantTuple[3],
    image: assistantTuple[2]?.startsWith("/")
      ? assistantTuple[2]
      : getStaffImagePath(assistantTuple[2] ?? assistantTuple[0]),
  },
  members: memberTuples.map(([name, role, filename, extraRoles], i) => ({
    id: `admin-${i + 3}`,
    name,
    role,
    extraRoles,
    image: filename?.startsWith("/")
      ? filename
      : getStaffImagePath(filename ?? name),
  })),
};

// Faculty and non-teaching can stay as before:
const earlyAdviserData: [string, string, string?, string[]?][] = [
  [
    "Ms. Hermalou P. Sancho, LPT",
    "Nursery Adviser",
    "ms-sancho",
    ["Property Custodian"],
  ],
  ["Ms. Tricia V. Rocha, LPT", "Kindergarten Adviser", "ms-rocha"],
];

const elementaryData: [string, string, string?, string[]?][] = [
  [
    "Mrs. Alysa Kris P. Lorino, LPT",
    "Grade 1 Adviser - St. Agnes",
    "mrs-lorino",
  ],
  [
    "Ms. Jaymie V. Santoalla, LPT",
    "Grade 1 Adviser - St. John Bosco",
    "ms-santoalla",
    ["AP-Fil Coordinator"],
  ],
  ["Ms. Kristle R. Oblena, LPT", "Grade 2 Adviser - St. Agatha", "ms-oblena"],
  ["Mrs. Reylen J. Alpay, LPT", "Grade 3 Adviser - St. Pius X", "mrs-alpay"],
  [
    "Ms. Joyce P. Acabo, LPT",
    "Grade 4 Adviser - St. Charles Borromeo",
    "ms-acabo",
    ["MAPEH-Culture & Arts Coordinator"],
  ],
  [
    "Mr. Phillip Jaishon S. Conchada, LPT",
    "Grade 5 Adviser - St. Aloysius Gonzaga",
    "mr-conchada",
    ["Elementary Academic Coordinator"],
  ],
  [
    "Mr. Gem O. Collado, LPT",
    "Grade 6 Adviser - St. Therese of the Child Jesus",
    "mr-collado",
    ["Culture & Arts Assistant Coordinator"],
  ],
];

const juniorData: [string, string, string?, string[]?][] = [
  [
    "Ms. Marielle T. Bombani, LPT",
    "Grade 7 Adviser - St. Clare of Assisi",
    "ms-bombani",
  ],
  [
    "Ms. Lea B. Catubig, LPT",
    "Grade 8 Adviser - St. Catherine of Alexandria",
    "ms-catubig",
  ],
  [
    "Mrs. Pauline Angelica R. Doctor, LPT",
    "Grade 8 Adviser - St. John of the Cross",
    "mrs-doctor",
    ["TLE Coordinator"],
  ],
  [
    "Mr. Mark Jetro B. Novio, LPT",
    "Grade 9 Adviser - St. Cecilia",
    "mr-novio",
    ["JHS Academic Coordinator"],
  ],
  ["Mr. Joshua A. Magsino, LPT", "Grade 9 Adviser - St. Joseph", "mr-magsino"],
  [
    "Mr. Jeric I. Abelgas, LPT",
    "Grade 10 Adviser - St. Lorenzo Ruiz",
    "mr-abelgas",
    ["SSLG Adviser"],
  ],
  [
    "Mr. Christian M. Maningas, LPT",
    "Grade 10 Adviser - St. Pedro Calungsod",
    "mr-maningas",
    ["MAPEH-Sports Coordinator"],
  ],
];

const seniorData: [string, string, string?, string[]?][] = [
  [
    "Mrs. Jonabelle S. Revilla, LPT",
    "Grade 11 Adviser - St. Ignatius of Loyola ",
    "mrs-revilla",
  ],
  [
    "Mrs. Diosby Mae M. Banton, LPT",
    "Grade 12 Adviser - St. Teresa of Avila",
    "ms-banton",
    ["English Coordinator"],
  ],
];

const subjectTeacherData: [string, string, string?, string[]?][] = [
  [
    "Mr. Kim Neil S. Bataller, LPT",
    "Subject Teacher",
    "mr-bataller",
    ["Math-Sci Coordinator"],
  ],
  ["Mr. John Karl D. Montero, LPT", "Subject Teacher", "mr-montero"],
  ["Mrs. Rialyn D. Blastique, LPT", "Subject Teacher", "mrs-blastique"],
  ["Ms. Maybel P. Villa, LPT", "Subject Teacher", "ms-villa"],
  ["Mr. Lloyd Kenneth S. Magtibay", "Subject Teacher", "mr-magtibay"],
];

const nonTeachingData: [string, string, string?, string[]?][] = [
  [
    "Mr. Antonio M. Borromeo Jr.",
    "Prefect of Discipline",
    "mr-borromeo",
    ["Subject Teacher", "Clinic In-Charge"],
  ],
  [
    "Ms. Liezel C. Ordiz, LPT",
    "Registrar",
    "ms-ordiz",
    ["Subject Teacher", "Director's Secretary", "IT Coordinator"],
  ],
  [
    "Mr. Mar Jon Daniel P. Urgelles",
    "Guidance Advocate",
    "mr-urgelles",
    ["CLM Coordinator"],
  ],
  [
    "Mrs. Maritzel M. Abcede",
    "School Librarian",
    "mrs-abcede",
    ["Library In-Charge"],
  ],
  ["Mrs. Michelle V. Talabong", "School Accounting Assistant", "mrs-talabong"],
  ["Mr. Amiel B. Aman", "Maintenance Head", "mr-aman", ["Liaison Officer"]],
  ["Mrs. Rodelyn C. Guerra", "Janitress", "mrs-guerra"],
  ["Mrs. Mayla C. Sardiñea", "Canteen Supervisor", "mrs-sardinea"],
  ["Mrs. Lorena M. Aman", "Canteener", "mrs-aman"],
  ["Mrs. Mary Joy R. Peñon", "Canteener", "mrs-penon"],
  ["Mr. Darwin C. Cambal", "School Porter", "mr-cambal"],
  ["Mr. William L. Palapag", "School Porter", "mr-palapag"],
];

function buildStaff(
  data: [string, string, string?, string[]?][],
  prefix: string,
): Person[] {
  return data.map(([name, role, filename, extraRoles], i) => ({
    id: `${prefix}${i + 1}`,
    name,
    role,
    extraRoles,
    image: filename?.startsWith("/")
      ? filename
      : getStaffImagePath(filename ?? name),
  }));
}

export const faculty: FacultyGroup = {
  earlyAdviser: buildStaff(earlyAdviserData, "ea"),
  elementary: buildStaff(elementaryData, "el"),
  juniorAdviser: buildStaff(juniorData, "ja"),
  seniorAdviser: buildStaff(seniorData, "sa"),
  subjectTeachers: buildStaff(subjectTeacherData, "st"),
};

export const nonTeaching: Person[] = buildStaff(nonTeachingData, "n");
