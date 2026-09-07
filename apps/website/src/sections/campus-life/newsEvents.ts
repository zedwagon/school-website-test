export interface NewsEvent {
  article: string[];
  author?: string;
  date: string;
  image: string;
  images?: { src: string; caption?: string }[];
  slug: string;
  title: string;
}

export const newsEvents: NewsEvent[] = [
  // Top 1
  {
    title: "#BrigadaEskwela2026",
    date: "June 2-4, 2026",
    article: [
      "The first day of Brigada Eskwela 2026 has successfully come to a close!🏫",
      "Today, Perpetuans came together with one goal in mind—to help prepare our school for a productive and welcoming academic year. Through teamwork, dedication, and a shared sense of responsibility, classrooms were cleaned, facilities were organized, and learning spaces were given the care they deserve.",
      "Every sweep of the broom, every desk arranged, and every helping hand extended reflected the true spirit of volunteerism and bayanihan. These collective efforts remind us that creating a better school environment is a responsibility we all share. 🤝",
      "As we wrap up Day 1, we extend our gratitude to all students who generously gave their time and energy. Your contributions have made a meaningful impact and set the tone for the days ahead.",
      "This is only the beginning—more work, more teamwork, and more opportunities to serve await us in the coming days. Together, we continue building a school that is ready, resilient, and prepared for success.",
      '"Small acts, when done together, create lasting change."✨',
    ],
    image: "/news-events/2026/brigada-eskwela-1.webp",
    images: [
      {
        src: "/news-events/2026/brigada-eskwela-1.webp",
        caption: "Brigada Eskwela 2026",
      },
      {
        src: "/news-events/2026/brigada-eskwela-2.webp",
        caption: "Brigada Eskwela 2026",
      },
      {
        src: "/news-events/2026/brigada-eskwela-3.webp",
        caption: "Brigada Eskwela 2026",
      },
      {
        src: "/news-events/2026/brigada-eskwela-4.webp",
        caption: "Brigada Eskwela 2026",
      },
      {
        src: "/news-events/2026/brigada-eskwela-5.webp",
        caption: "Brigada Eskwela 2026",
      },
    ],
    slug: "/news-events/2026/brigada-eskwela-2026",
    author: "SSLG",
  },
  // Top 2
  {
    title: "Faculty and Staff Retreat and Team Building 2026",
    date: "May 27–29, 2026",
    article: [
      "From May 27–29, the faculty and staff gathered at Our Lady of the Most Holy Rosary Seminary for a meaningful Retreat and Team Building Activity led by Rev. Fr. Kirth V. Molos. Through prayer, reflection, fellowship, and team-building activities, participants were given the opportunity to renew their faith, strengthen relationships, and deepen their commitment to the school’s mission and vision.",
      "The three-day gathering served as a time of spiritual renewal, personal growth, and unity, fostering stronger collaboration and camaraderie among the faculty and staff as they continue to serve the school community with dedication and excellence.",
    ],
    image: "/news-events/2026/faculty-staff-retreat-2.webp",
    images: [
      {
        src: "/news-events/2026/faculty-staff-retreat-2.webp",
        caption: "Faculty and Staff Retreat and Team Building 2026",
      },
      {
        src: "/news-events/2026/faculty-staff-retreat-1.webp",
        caption: "Faculty and Staff Retreat and Team Building 2026",
      },
      {
        src: "/news-events/2026/faculty-staff-retreat-3.webp",
        caption: "Faculty and Staff Retreat and Team Building 2026",
      },
      {
        src: "/news-events/2026/faculty-staff-retreat-4.webp",
        caption: "Faculty and Staff Retreat and Team Building 2026",
      },
    ],
    slug: "/news-events/2026/faculty-staff-retreat-2026",
    author: "Seraphim",
  },
  // Top 3
  {
    title: "Groundbreaking Ceremony",
    date: "April 19, 2026 | 9:30 AM",
    article: [
      "Mother Perpetua Parochial School Inc. (MPPSI) warmly invites you to the Groundbreaking Ceremony for the construction of our new school building. This milestone marks the beginning of a new chapter in our mission to provide better facilities and a more conducive learning environment for our students.",
    ],
    image: "/news-events/2026/groundbreaking.webp",
    images: [
      {
        src: "/news-events/2026/groundbreaking.webp",
        caption: "Groundbreaking Ceremony",
      },
    ],
    slug: "/news-events/2026/groundbreaking-2026",
    author: "Seraphim",
  },
  // More Announcements
  {
    title: "ENROLL NOW at MPPSI! S.Y. 2026–2027",
    date: "May 23, 2026",
    article: [
      "Step into a future filled with excellence, values, and opportunity at Mother Perpetua Parochial School Inc. (MPPSI)!",
      "From Pre-Elementary to Senior High School, MPPSI offers quality Catholic education that shapes not only minds—but hearts and character.",
      "Why choose MPPSI?",
      "✔️ Strong academic programs",
      "✔️ Holistic formation",
      "✔️ Senior High School tracks available",
      "✔️ Scholarships and discounts offered",
      "Classes start on June 8, 2026",
      "Enrollment is ongoing!",
      "Don’t miss the chance to be part of a community that inspires growth, faith, and success.",
      "Join us and soar high, Perpetuans!",
    ],
    image: "/news-events/2026/enroll-now.webp",
    images: [
      {
        src: "/news-events/2026/enroll-now.webp",
        caption: "Enroll Now at MPPSI! S.Y. 2026–2027",
      },
    ],
    slug: "/news-events/2026/enroll-now-2026",
    author: "Seraphim",
  },
  {
    title: "Getting Ready for S.Y. 2026–2027",
    date: "May 5, 2026",
    article: [
      "On May 5, 2026, MPPSI conducted an Orientation and Meeting in preparation for the upcoming School Year 2026–2027. The gathering served as an opportunity to discuss important updates, align plans and expectations, and strengthen collaboration among faculty and staff as they prepare for another productive academic year.",
      "Through this activity, MPPSI continues its commitment to excellence, teamwork, and quality education in serving the school community.",
    ],
    image: "/news-events/2026/getting-ready.webp",
    images: [
      {
        src: "/news-events/2026/getting-ready.webp",
        caption: "Getting Ready for S.Y. 2026–2027",
      },
    ],
    slug: "/news-events/2026/getting-ready-2026",
    author: "Seraphim",
  },
  {
    title: "Introducing the New MPPSI Website",
    date: "April 28, 2026",
    article: [
      "On April 28, 2026, MPPSI conducted a meeting regarding the implementation of the new MPPSI Portal. This initiative aims to provide a more efficient and convenient platform for communication, information access, and school-related services for students, parents, faculty, and staff. Stay tuned as MPPSI continues to enhance its digital services for the school community.",
    ],
    image: "/news-events/2026/website-1.webp",
    images: [
      {
        src: "/news-events/2026/website-1.webp",
        caption: "Brigada Eskwela 2026",
      },
    ],
    slug: "/news-events/2026/website-2026",
    author: "Seraphim",
  },
  {
    title: "MPPSI Foundation Anniversary",
    date: "November 26, 2025",
    article: [
      "MPPSI celebrated its Foundation Anniversary with a grand event that highlighted the school's achievements in academics, community service, and extracurricular programs. The celebration featured inspiring speeches from faculty, alumni, and school leaders. Students showcased their talents through performances and exhibitions. Outstanding students and staff were recognized with awards for their significant contributions, reflecting the enduring legacy and spirit of MPPSI.",
    ],
    image: "/news-events/2025/foundation-anniversary-1.webp",
    images: [
      {
        src: "/news-events/2025/foundation-anniversary-1.webp",
        caption: "Opening ceremony of the anniversary",
      },
      {
        src: "/news-events/2025/foundation-anniversary-2.webp",
        caption: "Student cultural performances",
      },
      {
        src: "/news-events/2025/foundation-anniversary-3.webp",
        caption: "Awarding ceremony for outstanding contributors",
      },
      {
        src: "/news-events/2025/foundation-anniversary-4.webp",
        caption: "Alumni gathering and networking",
      },
      {
        src: "/news-events/2025/foundation-anniversary-5.webp",
        caption: "Group photo of faculty, staff, and students",
      },
    ],
    slug: "/news-events/2025/foundation-anniversary",
    author: "Seraphim",
  },
];
