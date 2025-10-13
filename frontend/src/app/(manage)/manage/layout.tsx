import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ManageSidebar from "@/components/manage-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <ManageSidebar/>
        <main className="w-full flex flex-col pr-4">
          <SidebarTrigger />
          {children}
        </main>
    </SidebarProvider>
  )
}
