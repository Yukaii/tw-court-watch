import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/guide", "/about"],
        disallow: ["/hearings/", "/saved", "/notes/"],
      },
    ],
  };
}
