import { FileText, Home, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useUserLogout } from "@/hooks/user-hook"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "文章管理",
    url: "/manage",
    icon: FileText,
  },
  {
    title: "首页",
    url: "/",
    icon: Home,
  },
  {
    title: "个人信息",
    url: "/manage/profile",
    icon: User,
  },
  {
    title: "设置",
    url: "/manage/settings",
    icon: Settings,
  },
]

export default function ManageSidebar() {
  const logout = useUserLogout()
  
  const handleLogout = () => {
    logout()
  }
  
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <div className="flex flex-1 items-center justify-between">
                  <span>管理</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>管理</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-red-500">
                  <LogOut />
                  <span>退出登录</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
