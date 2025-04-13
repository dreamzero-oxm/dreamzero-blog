import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
  {
    "url": "/",
    lastModified: new Date("2025-04-13T02:21:00.161Z"),
    "changeFrequency": "daily",
    "priority": 1
  },
  {
    "url": "/blog",
    lastModified: new Date("2025-04-13T02:21:00.164Z"),
    "changeFrequency": "daily",
    "priority": 0.9
  },
  {
    "url": "blog/MyCurrentSituation",
    lastModified: new Date("2025-04-12T12:10:00.000Z"),
    "changeFrequency": "weekly",
    "priority": 0.8
  },
  {
    "url": "init/hello-world",
    lastModified: new Date("2025-04-05T12:10:00.000Z"),
    "changeFrequency": "weekly",
    "priority": 0.8
  },
  {
    "url": "init/intro",
    lastModified: new Date("2025-04-05T13:10:00.000Z"),
    "changeFrequency": "weekly",
    "priority": 0.8
  }
]
}
