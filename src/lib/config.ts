export const config = {
  site: {
    title: "Moity Soeoe",
    name: "Moity Soeoe的博客",
    description: "Moity Soeoe的博客",
    keywords: ["Moity Soeoe", "AI", "Full Stack Developer"],
    url: "https://moity-soeoe.com",
    baseUrl: "https://moity-soeoe.com",
    image: "https://moity-soeoe.com/og-image.png",
    favicon: {
      ico: "/favicon.ico",
      png: "/favicon.png",
      svg: "/favicon.svg",
      appleTouchIcon: "/favicon.png",
    },
    manifest: "/site.webmanifest",
    rss: {
      title: "Moity Soeoe的博客",
      description: "Practice of Full Stack Engineer",
      feedLinks: {
        rss2: "/rss.xml",
        json: "/feed.json",
        atom: "/atom.xml",
      },
    },
  },
  author: {
    name: "Moity Soeoe",
    email: "ouxiangming_moi@foxmail.com",
    bio: "Moity Soeoe(XiangMing Ou)",
  },
  social: {
    github: "https://github.com/This-MOI",
    x: "https://x.com/xxx",
    xiaohongshu: "https://www.xiaohongshu.com/user/profile/xxx",
    wechat: "https://storage.xxx.com/images/wechat-official-account.png",
    buyMeACoffee: "https://www.buymeacoffee.com/xxx",
  },
  giscus: {
    repo: "guangzhengli/hugo-ladder-exampleSite",
    repoId: "R_kgDOHyVOjg",
    categoryId: "DIC_kwDOHyVOjs4CQsH7",
  },
  navigation: {
    main: [
      { 
        title: "文章", 
        href: "/blog",
      },
    ],
  },
  seo: {
    metadataBase: new URL("https://xxx.com"),
    alternates: {
      canonical: './',
    },
    openGraph: {
      type: "website" as const,
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image" as const,
      creator: "@xxx",
    },
  },
};
