'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ManageSidebar from "@/components/manage-sidebar"
import { useCheckAndRefreshToken } from "@/hooks/auth-hook";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { checkAndRefresh, isLoading } = useCheckAndRefreshToken();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await checkAndRefresh();
        if (!isValid) {
          router.push('/login');
        }
      } catch (error) {
        console.error('认证检查失败:', error);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]); // 移除checkAndRefresh依赖，避免无限循环
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>加载中...</div>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <ManageSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
