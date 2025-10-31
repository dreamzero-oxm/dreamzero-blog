'use client'
import { Header } from "@/components/header";
import { useCheckAndRefreshToken } from "@/hooks/auth-hook";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { checkAndRefresh, isLoading } = useCheckAndRefreshToken('main');
  const router = useRouter();
  const isAuthenticated = useRef(false);

  useEffect(() => {
    // 如果已经验证过身份，则不再重复验证
    if (isAuthenticated.current) {
      return;
    }
    
    const authenticate = async () => {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        // 没有access token，不进行任何操作
        isAuthenticated.current = true;
        return;
      }
      
      try {
        // 验证并刷新token
        const success = await checkAndRefresh();
        if (success) {
          isAuthenticated.current = true;
        }
      } catch (error) {
        console.error('身份验证失败:', error);
        isAuthenticated.current = true;
      }
    };
    
    authenticate();
  }, [checkAndRefresh, router]);

  // 如果正在验证token，显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">验证身份中...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}
