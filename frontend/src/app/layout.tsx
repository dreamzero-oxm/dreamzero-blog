import type { Metadata } from "next";
import "@/app/globals.css";
import { config } from "@/lib/config";
import ReactQueryProvider from "@/components/provider/react-query-provider";
import localFont from 'next/font/local'
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"
import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Link from 'next/link';
import AuthProvider from "@/components/provider/auth-provider";

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
      </head>
      <body>
        <ReactQueryProvider>
          <AntdRegistry>
            <AuthProvider>
              <div className="min-w-screen min-h-screen overflow-x-hidden flex flex-col">
                <main className="flex-1">
                  {children}
                  <Toaster expand={true} position="bottom-right" richColors/>
                </main>
                <footer className="w-full flex justify-center items-center p-4 mt-auto">
                  <Link href={'https://beian.miit.gov.cn'} className="underline underline-offset-4">
                    粤ICP备2025480966号-1
                  </Link>
                </footer>
              </div>
            </AuthProvider>
          </AntdRegistry>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
