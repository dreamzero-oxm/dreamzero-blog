'use client'

import { Header } from "@/components/header";
import Link from "next/link";
// import AuthProvider from "@/components/provider/auth-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    // <AuthProvider routeType="main">
      <div className="flex-1 min-h-full w-full flex flex-col">
        <Header />
        <div className="bg-background flex-1">
          {children}
        </div>
        <footer className="w-full flex justify-center items-center p-4 bg-background border-t flex-shrink-0">
          <Link href={'https://beian.miit.gov.cn'} className="underline underline-offset-4 text-sm whitespace-nowrap">
            粤ICP备2025480966号-1
          </Link>
        </footer>
      </div>
    // </AuthProvider>
  );
}
