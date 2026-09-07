// data/facilities.ts
export interface Facility {
  description: string;
  image: string;
  images?: string[]; // additional images for carousel
  name: string;
}

export const facilities: Facility[] = [
  {
    name: "Library",
    description:
      "A quiet space with extensive resources to support learning and research.",
    image: "/facilities/library.webp",
    images: [
      "/facilities/library.webp",
      "/facilities/library-1.webp",
      "/facilities/library-2.webp",
      "/facilities/library-3.webp",
      "/facilities/library-4.webp",
      "/facilities/library-5.webp",
      "/facilities/library-6.webp",
    ],
  },
  {
    name: "Computer Room",
    description: "Equipped with computers and software for digital learning.",
    image: "/facilities/computer-room.webp",
    images: [
      "/facilities/computer-room.webp",
      "/facilities/computer-room-1.webp",
    ],
  },
  {
    name: "Science Labs",
    description:
      "Biology, chemistry, and physics labs with modern equipment for experiments.",
    image: "/facilities/biology-lab.webp",
    images: [
      "/facilities/biology-lab.webp",
      "/facilities/chemistry-lab.webp",
      "/facilities/physics-lab.webp",
    ],
  },
  {
    name: "Sports Facilities",
    description:
      "Basketball court, covered court, and other areas for physical activities.",
    image: "/facilities/basketball-court.webp",
    images: [
      "/facilities/basketball-court.webp",
      "/facilities/covered-court.webp",
    ],
  },
  {
    name: "Faculty Rooms & Offices",
    description: "Spaces for faculty, administration, and student services.",
    image: "/facilities/faculty-room.webp",
    images: [
      "/facilities/faculty-room.webp",
      "/facilities/faculty-room-1.webp",
      "/facilities/accounting-office.webp",
      "/facilities/accounting-office-1.webp",
      "/facilities/accounting-office-2.webp",
      "/facilities/accounting-office-3.webp",
    ],
  },
  {
    name: "Other Facilities",
    description:
      "Canteen, porter post, waiting area, and washing area for students and staff.",
    image: "/facilities/canteen.webp",
    images: [
      "/facilities/canteen.webp",
      "/facilities/school-porter-post.webp",
      "/facilities/waiting-area.webp",
      "/facilities/washing-area.webp",
    ],
  },
  {
    name: "Classrooms",
    description: "Standard and specialized classrooms for learning activities.",
    image: "/facilities/classroom.webp",
    images: ["/facilities/classroom.webp", "/facilities/classroom-1.webp"],
  },
];
