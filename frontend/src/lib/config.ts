export const config = {
  site: {
    title: "归零重启(DreamZero)",
    name: "DreamZero的博客",
    description: "DreamZero的博客",
    keywords: ["DreamZero", "AI", "Full Stack Developer"],
    url: "https://dreamzero.cn",
    baseUrl: "https://dreamzero.cn",
    image: "https://dreamzero.cn/og-image.png",
    favicon: {
      ico: "/favicon.ico",
      png: "/favicon.png",
      svg: "/favicon.svg",
      appleTouchIcon: "/favicon.png",
    },
    manifest: "/site.webmanifest",
    rss: {
      title: "DreamZero的博客",
      description: "Practice of Full Stack Engineer",
      feedLinks: {
        rss2: "/rss.xml",
        json: "/feed.json",
        atom: "/atom.xml",
      },
    },
  },
  author: {
    name: "DreamZero",
    email: "ouxiangming@dreamzero.cn",
    bio: "XiangMing Ou(DreamZero)",
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
        title: "日常",
        href: "/informal-photographs",
      },
    ],
  },
  // 配置 SEO 相关的配置
  // 搜索引擎优化
  seo: {
    metadataBase: new URL("https://dreamzero.cn"),
    alternates: {
      canonical: './',
    },
    openGraph: {
      type: "website" as const,
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image" as const,
      creator: "@dreamzero",
    },
  },
};

// export const apiAddress = 'myhost'
export const apiAddress = process.env.NODE_ENV === 'development' 
  ? '10.21.23.14' 
  : 'www.dreamzero.cn'
export const apiPort = process.env.NODE_ENV === 'development' 
  ? '9997' 
  : '80'
export const useSSL = process.env.NODE_ENV === 'production'
