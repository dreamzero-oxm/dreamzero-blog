import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
  {
    "url": "/",
    lastModified: new Date("2025-04-22T12:26:30.518Z"),
    "changeFrequency": "daily",
    "priority": 1
  },
]
}
