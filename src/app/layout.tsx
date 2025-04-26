import type { Metadata } from "next";
import "@/app/globals.css";
import { config } from "@/lib/config";
import ReactQueryProvider from "@/components/provider/react-query-provider";
import localFont from 'next/font/local'
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  // 标题
  title: config.site.title,
  // 描述
  description: config.site.description,
  // 关键字
  keywords: config.site.keywords,
  // 元数据的基本URL
  metadataBase: config.seo.metadataBase,
  // 
  alternates: config.seo.alternates,
  // 图标
  icons: [
    { rel: "icon", url: config.site.favicon.png, sizes: "48x48", type: "image/png" },
    { rel: "icon", url: config.site.favicon.svg, type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: config.site.favicon.appleTouchIcon, sizes: "180x180" },
  ],
  // 
  openGraph: {
    url: config.site.url,
    type: config.seo.openGraph.type,
    title: config.site.title,
    description: config.site.description,
    images: [
      { url: config.site.image }
    ]
  },
  twitter: {
    site: config.site.url,
    card: config.seo.twitter.card,
    title: config.site.title,
    description: config.site.description,
    images: [
      { url: config.site.image }
    ]
  },
  manifest: config.site.manifest,
  appleWebApp: {
    title: config.site.title,
  },
};

const lxgwFont = localFont({
  src: [
      {
          path: '../fonts/lxgw-wenkai/LXGWWenKai-Light.ttf',
          weight: '400',
          style: 'normal',
      },
      {
          path: '../fonts/lxgw-wenkai/LXGWWenKai-Regular.ttf',
          weight: '500',
          style: 'normal',
      },
      {
          path: '../fonts/lxgw-wenkai/LXGWWenKai-Medium.ttf',
          weight: '600',
          style: 'normal',
      },
  ],
  variable: '--font-chinese'
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(lxgwFont.className)}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss.xml" />
        <link rel="alternate" type="application/atom+xml" title="Atom" href="/atom.xml" />
        <link rel="alternate" type="application/json" title="JSON" href="/feed.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script defer src="http://10.21.23.14:10000/script.js" data-website-id="f04cae10-5687-49b1-8299-7971ccf122cd"></script>
      </head>
      <body className="min-w-md overflow-x-hidden">
        <ReactQueryProvider>
          <main>
            {children}
            <Toaster expand={true}/>
          </main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
