import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mppsi.edu.ph";

  const routes = [
    "",
    "/accreditation-achievements",
    "/administration-faculty",
    "/board-of-trustees",
    "/history-hymn-logo",
    "/vision-mission",
    "/accounting",
    "/basic-education",
    "/registrar",
    "/scholarship",
    "/alumni-testimonials",
    "/facilities",
    "/news-events",
    "/organizations",
    "/school-calendar",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
