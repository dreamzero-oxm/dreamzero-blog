import "@/app/globals.css";
import { Header } from "@/components/header";
import SplashCursor from "@/components/ui/SplashCursor";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="hidden md:block"><SplashCursor /></div>
      {children}
    </>
  );
}
