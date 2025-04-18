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
      png: "/favicon.jpg",
      svg: "/favicon.svg",
      appleTouchIcon: "/favicon.jpg",
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
    wechat: "https://u.wechat.com/MEJWuTspfYpz_TR8Do3CmKY",
    buyMeACoffee: "https://www.buymeacoffee.com/xxx",
  },
  // 评论，需要在在 GitHub 上安装 Giscus 应用，暂时不用
  giscus: {
    repo: "guangzhengli/hugo-ladder-exampleSite",
    repoId: "R_kgDOHyVOjg",
    categoryId: "DIC_kwDOHyVOjs4CQsH7",
  },
  // 配置导航的菜单配置
  navigation: {
    main: [
      { 
        title: "文章", 
        href: "/blog",
      },
      { 
        title: "友商", 
        href: "/blog",
        submenu: [
          {
            title: "Aimerick",
            href: "https://www.aimerick.cc/",
          },
        ]
      },
      { 
        title: "Nginx", 
        href: "/nginx/",
      },
      {
        title: "日常",
        href: "/informal-photographs",
      },
    ],
  },
  // 配置 SEO 相关的配置
  // 搜索引擎优化
  seo: {
    metadataBase: new URL("https://moity-soeoe.com"),
    alternates: {
      canonical: './',
    },
    openGraph: {
      type: "website" as const,
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image" as const,
      creator: "@moity",
    },
  },
};
