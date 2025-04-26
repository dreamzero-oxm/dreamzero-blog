"use client";

import Link from "next/link";
import { NavDesktopMenu } from "./nav-desktop-menu";
import { NavMobileMenu } from "./nav-mobile-menu";
import GithubIcon from "@/components/icons/github";
// import XiaohongshuIcon from "@/components/icons/xiaohongshu";
// import XIcon from "@/components/icons/x";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
// import { SquareTerminal } from "lucide-react";
import Image from 'next/image';
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Fingerprint } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const isBlogPage = pathname.includes("/blog/");
  
  // 使用函数来初始化状态，避免直接访问 localStorage
  const [dark, setDark] = useState(false);  // 初始值设为 false
  
  // 添加一个新的 useEffect 来处理初始化
  useEffect(() => {
    // 在客户端执行时初始化主题
    const isDark = 
      localStorage.theme === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
  }, []);
  
  useEffect(() => {
    if (dark) {
      localStorage.theme = "dark";
      document.documentElement.classList.add('dark')
    } else {
      localStorage.theme = "light";
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  return (
    <header className="pt-4">
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
          {/* <SquareTerminal className="w-10 h-10" /> */}
          <Image
            src='/favicon.svg'
            width={10}
            height={10}
            alt='logo'
            className='w-10 h-10'
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:block">
          <NavDesktopMenu />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2 md:space-x-8 mr-4">
          <div className="flex items-center gap-2">
            {dark ? <Moon /> : <Sun />}
            <Switch
              className="cursor-pointer"
              checked={dark}  // 添加checked属性来控制开关状态
              onCheckedChange={(checked) => {
                console.log(checked);
                setDark(checked);
              }}
            />
          </div>
          <Link href="/login" title="Login">
            <Fingerprint />
          </Link>
          <Link href="https://github.com/This-MOI" title="Github">
            <GithubIcon />
          </Link>
          {/* <Link href="https://x.com/This-MOI" title="X">
            <XIcon />
          </Link> */}
          {/* <Link href="https://www.xiaohongshu.com/" title="Xiaohongshu">
            <XiaohongshuIcon />
          </Link> */}
        </div>
      </motion.div>
    </header >
  );
}
