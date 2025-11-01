/**
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/(main)/page.tsx
 * @description 网站主页组件，展示个人简介、精选博客和技术栈
 * @mainFunctionality 展示个人简介、精选博客文章和技术栈徽章
 * @author DreamZero Team
 * @lastModified 2023-12-01
 */

// 导入所需的依赖和组件
import { allBlogs } from "content-collections"; // 导入所有博客文章数据
import Link from "next/link"; // 导入Next.js的Link组件，用于客户端导航
import count from 'word-count'; // 导入字数统计工具
import { config } from "@/lib/config"; // 导入网站配置信息
import { Badge } from "@/components/ui/badge"; // 导入UI徽章组件

/**
 * @description 网站主页组件
 * @component Home
 * @returns {JSX.Element} 返回主页的JSX结构
 * 
 * 页面功能：
 * - 展示个人简介和技术栈
 * - 显示精选博客文章（按日期降序排列）
 * - 提供博客文章导航链接
 */
export default function Home() {
  // 获取精选博客文章：过滤出featured为true的文章，并按日期降序排序
  const blogs = allBlogs
    .filter((blog: any) => blog.featured === true)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col min-h-full">
      {/* 个人介绍部分 - 包含网站标题、个人简介和技术栈 */}
      <div className="mb-16 space-y-4">
        <h1 className="text-4xl font-bold">{config.site.title}</h1>
        <p className="text-md text-gray-600">{config.author.bio}</p>
        
        {/* 社交链接 */}
        {/* <div className="flex space-x-2 text-gray-600">
          <Link href={config.social.buyMeACoffee} className="underline underline-offset-4">赞赏</Link>
          <span>·</span>
          <Link href={config.social.x} className="underline underline-offset-4">X</Link>
          <span>·</span>
          <Link href={config.social.xiaohongshu} className="underline underline-offset-4">小红书</Link>
          <span>·</span>
          <Link href={config.social.wechat} className="underline underline-offset-4">微信</Link>
        </div> */}
        <div className="space-x-4">
          <Badge variant="secondary">Java</Badge>
          <Badge variant="secondary">Go</Badge>
          <Badge variant="secondary">Python</Badge>
          <Badge variant="secondary">JavaScript</Badge>
          <Badge variant="secondary">TypeScript</Badge>
        </div>
        <div className="space-x-4">
          <Badge variant="secondary">MySQL</Badge>
          <Badge variant="secondary">RabbitMQ</Badge>
          <Badge variant="secondary">Redis</Badge>
          <Badge variant="secondary">Docker</Badge>
          <Badge variant="secondary">K8s</Badge>
        </div>
        <div className="space-x-4">
          <Badge variant="secondary">SpringBoot</Badge>
          <Badge variant="secondary">SpringCloud</Badge>
          <Badge variant="secondary">SpringSecurity</Badge>
          <Badge variant="secondary">MyBatis</Badge>
        </div>
        <div className="space-x-4">
          <Badge variant="secondary">React</Badge>
        </div>
      </div>

      {/* 精选博客文章列表部分 */}
      <div className="space-y-4 flex-1">
        <h2 className="text-2xl font-bold mb-8">推荐阅读</h2>
        <div className="space-y-8">
          {/* 遍历并渲染每篇精选博客文章 */}
          {blogs.map((blog: any) => (
            <article key={blog.slug} className="">
              <Link href={`/blog/${blog.slug}`}>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold underline underline-offset-4">
                      {blog.title}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {/* 格式化日期显示为中文格式，并显示文章字数 */}
                      {new Date(blog.date).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      }).replace(/\//g, '年').replace(/\//g, '月') + '日'} · {count(blog.content)} 字
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">
                    {blog.summary}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
