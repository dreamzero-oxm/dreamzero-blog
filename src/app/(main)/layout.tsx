'use client'
import { Header } from "@/components/header";
import Crosshair from '@/components/Crosshair';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="hidden md:block">
        {/* <SplashCursor /> */}
        <div className="block dark:hidden">
          <Crosshair color='#000000'/>
        </div>
        <div className="hidden dark:block">
          <Crosshair color='#ffffff'/>
        </div>
      </div>
      {children}
    </>
  );
}
