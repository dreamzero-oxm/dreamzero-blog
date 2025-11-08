'use client';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ManageSidebar from "@/components/manage-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
      <SidebarProvider>
        <ManageSidebar />
        <div className="flex-1 flex flex-col">
          <div className="h-14 border-b flex items-center px-4 bg-background">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-lg font-semibold">管理后台</h1>
          </div>
          <div className="flex-1 p-4">
            {children}
          </div>
        </div>
      </SidebarProvider>
  );
}
