'use client';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ManageSidebar from "@/components/manage-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
      <SidebarProvider>
        <ManageSidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <div className="h-14 border-b flex items-center px-3 sm:px-4 bg-background sticky top-0 z-10">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-base sm:text-lg font-semibold truncate">管理后台</h1>
          </div>
          <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
            <div className="max-w-full">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
  );
}
