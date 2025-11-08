/**
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/(login)/login/page.tsx
 * @description 用户登录页面组件，提供用户登录界面
 * @mainFunctionality 提供用户登录表单和品牌展示，包含响应式布局和背景图片
 * @author DreamZero Team
 * @lastModified 2023-12-01
 */

'use client'

// 导入所需的React组件和自定义组件
import { Shell } from "lucide-react"; // 导入Shell图标组件，用于品牌标识
import LoginForm from "@/components/login-form"; // 导入自定义登录表单组件
import Link from "next/link"; // 导入Next.js的Link组件，用于客户端导航
import Image from "next/image"; // 导入Next.js的Image组件，用于优化图片加载

/**
 * 登录页面组件
 * @component Page
 * @description 提供用户登录界面，包含品牌标识、登录表单和背景图片
 * @returns {JSX.Element} 返回登录页面的JSX结构
 * 
 * 页面布局采用响应式设计：
 * - 移动设备：单列布局，显示登录表单
 * - 桌面设备：双列布局，左侧显示登录表单，右侧显示背景图片
 */
export default function Page() {
    return (
        // 使用网格布局创建响应式双列结构
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* 左侧列：包含品牌标识和登录表单 */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                {/* 品牌标识区域：包含Logo和网站名称 */}
                <div className="flex justify-center gap-2 md:justify-start">
                    {/* 首页链接，点击可返回网站首页 */}
                    <Link href="/" title="home" className="flex items-center gap-2 font-medium">
                        {/* Logo容器：设置固定尺寸和圆角样式 */}
                        <div className="flex h-6 w-6 items-center justify-center rounded-md ">
                            {/* Shell图标作为网站Logo */}
                            <Shell className="size-6" />
                        </div>
                        {/* 网站名称 */}
                        DreamZero Blog.
                    </Link>
                </div>
                
                {/* 登录表单区域：垂直居中显示 */}
                <div className="flex flex-1 items-center justify-center">
                    {/* 表单容器：限制最大宽度以保持良好的视觉比例 */}
                    <div className="w-full max-w-xs">
                        {/* 登录表单组件 */}
                        <LoginForm />
                    </div>
                </div>
            </div>
            
            {/* 右侧列：背景图片区域（仅在桌面设备显示） */}
            <div className="relative hidden bg-muted lg:block ">
                {/* 背景图片：使用Next.js的Image组件进行优化 */}
                <Image 
                    src="/images/loginBanner.jpeg" // 图片路径
                    alt="loginBanner" // 图片替代文本，提高可访问性
                    width={1920} // 图片原始宽度
                    height={1080} // 图片原始高度
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6] dark:grayscale" // 样式类：覆盖整个容器，保持比例，暗色模式下降低亮度并添加灰度效果
                />
            </div>
        </div>
    )
}