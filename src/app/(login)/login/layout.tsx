"use client";

import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 添加一个新的 useEffect 来处理初始化
  useEffect(() => {
    // 在客户端执行时初始化主题
    const isDark = 
      localStorage.theme === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, []);
  return (
    <>
      {children}
    </>
  );
}
