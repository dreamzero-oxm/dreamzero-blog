'use client'
import { Header } from "@/components/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full w-full flex flex-col">
      <Header />
      <div className="hidden md:block">
        {/* <SplashCursor /> */}
        {/* <div className="block dark:hidden z-0">
          <LiquidEther
            colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div> */}
        {/* <div className="hidden dark:block">
          <LiquidEther color='#ffffff'/>
        </div> */}
      </div>
      <div className="bg-background">
        {children}
      </div>
    </div>
  );
}
