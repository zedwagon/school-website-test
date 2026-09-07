import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/login", "/print/"],
    },
    sitemap: "https://mppsi.edu.ph/sitemap.xml",
  };
}
