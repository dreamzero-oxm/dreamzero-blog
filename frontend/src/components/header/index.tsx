"use client";

import Link from "next/link";
import { NavDesktopMenu } from "./nav-desktop-menu";
import { NavMobileMenu } from "./nav-mobile-menu";
import GithubIcon from "@/components/icons/github";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Fingerprint, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUserLogout } from '@/hooks/user-hook'

export function Header() {
  const pathname = usePathname();
  const isBlogPage = pathname.includes("/blog/");
  const [isLogin, setIsLogin] = useState(false);
  const logout = useUserLogout();
  
  // 使用函数来初始化状态，避免直接访问 localStorage
  const [dark, setDark] = useState(false);  // 初始值设为 false
  
  // 添加一个新的 useEffect 来处理初始化
  useEffect(() => {
    // 在客户端执行时初始化主题
    const isDark = 
      localStorage.theme === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // 检测token
    const accessToken = localStorage.getItem("access_token");
    console.log("access_token", !!accessToken);
    setIsLogin(!!accessToken);
  }, []);

  // 监听storage事件，以便在其他标签页中清除token时更新登录状态
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        const accessToken = localStorage.getItem("access_token");
        setIsLogin(!!accessToken);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 监听自定义事件，以便在同一标签页中清除token时更新登录状态
  useEffect(() => {
    const handleTokenChange = () => {
      const accessToken = localStorage.getItem("access_token");
      setIsLogin(!!accessToken);
    };

    window.addEventListener('tokenChange', handleTokenChange);
    return () => {
      window.removeEventListener('tokenChange', handleTokenChange);
    };
  }, []);

  const handleSwitchTheme = (isDark: boolean) => {
    setDark(isDark);
    if (isDark) {
      localStorage.theme = "dark";
      document.documentElement.classList.add('dark')
    } else {
      localStorage.theme = "light";
      document.documentElement.classList.remove('dark')
    }
  }


  return (
    <header className="">
      <motion.div
        initial={{ maxWidth: "48rem" }}
        animate={{ maxWidth: isBlogPage ? "72rem" : "48rem" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={cn("container mx-auto flex h-16 items-center justify-between md:px-4", isBlogPage ? "max-w-4xl xl:max-w-6xl" : "max-w-3xl")}
      >
        {/* Mobile navigation */}
        <NavMobileMenu />

        {/* Logo */}
        <Link href="/" title="Home" className="flex items-center gap-4 md:order-first">
          <Avatar>
            <AvatarImage src="/avatar.jpg" />
            <AvatarFallback>XM</AvatarFallback>
          </Avatar>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:block">
          <NavDesktopMenu />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2 md:space-x-8 mr-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {dark ? <Moon /> : <Sun />}
                  <Switch
                    className="cursor-pointer"
                    checked={dark}  // 添加checked属性来控制开关状态
                    onCheckedChange={handleSwitchTheme}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>明亮切换</p>
              </TooltipContent>
            </Tooltip>
            {isLogin ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-pointer" onClick={async ()=>{
                    await logout();
                    setIsLogin(false);
                    // 强制刷新页面，确保所有状态都被重置
                    window.location.reload();
                  }}>
                    <LogOut />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>登出</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                <Link href="/login" title="Login">
                      <Fingerprint />
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>登录</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="https://github.com/This-MOI" title="Github">
                  <GithubIcon />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Github</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
    </header >
  );
}
