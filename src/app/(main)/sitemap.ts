import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
  {
    "url": "/",
    lastModified: new Date("2025-04-22T12:26:30.518Z"),
    "changeFrequency": "daily",
    "priority": 1
  },
  {
    "url": "/blog",
    lastModified: new Date("2025-04-22T12:26:30.518Z"),
    "changeFrequency": "daily",
    "priority": 0.9
  },
  {
    "url": "blog/MyCurrentSituation",
    lastModified: new Date("2025-04-12T12:10:00.000Z"),
    "changeFrequency": "weekly",
    "priority": 0.8
  }
]
}
