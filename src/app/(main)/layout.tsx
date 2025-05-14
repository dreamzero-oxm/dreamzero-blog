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
        <Crosshair color='#000000'/>
      </div>
      {children}
    </>
  );
}
