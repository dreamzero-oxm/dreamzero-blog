/**
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/(main)/blog/page.tsx
 * @description 博客列表页面组件，展示所有博客文章
 * @mainFunctionality 获取并展示所有博客文章列表，按日期排序
 * @author DreamZero Team
 * @lastModified 2023-12-01
 */

// 导入所需的依赖和组件
import { type Metadata } from "next"; // 导入Next.js的Metadata类型，用于页面元数据
import { allBlogs } from "content-collections"; // 导入所有博客文章数据
import Link from "next/link"; // 导入Next.js的Link组件，用于客户端导航
import count from 'word-count' // 导入字数统计工具
import { config } from "@/lib/config"; // 导入网站配置信息

/**
 * @description 页面元数据配置
 * @type {Metadata}
 * @property {string} title - 页面标题，格式为"Blogs | 网站名称"
 * @property {string} description - 页面描述，用于SEO
 * @property {string} keywords - 页面关键词，用于SEO
 */
export const metadata: Metadata = {
  title: `Blogs | ${config.site.title}`,
  description: `Blogs of ${config.site.title}`,
  keywords: `${config.site.title}, blogs, ${config.site.title} blogs`,
};

/**
 * @description 博客列表页面组件
 * @component BlogPage
 * @returns {JSX.Element} 返回博客列表页面的JSX结构
 * 
 * 页面功能：
 * - 获取所有博客文章
 * - 按发布日期降序排序
 * - 展示博客文章列表，包含标题、日期、字数和摘要
 */
export default function BlogPage() {
  // 获取所有博客文章并按发布日期降序排序（最新的在前）
  const blogs = allBlogs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  console.log(blogs);

  return (
    // 页面容器：设置最大宽度、水平居中、内边距
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 博客文章列表容器：设置垂直间距 */}
      <div className="space-y-8">
        {/* 遍历博客文章列表，渲染每篇文章 */}
        {blogs.map((blog: any) => (
          // 文章容器：使用文章的slug作为唯一key
          <article 
            key={blog.slug} 
            className=""
          >
            {/* 文章链接：点击可跳转到文章详情页 */}
            <Link href={`/blog/${blog.slug}`}>
              {/* 文章内容容器：垂直布局，设置间距 */}
              <div className="flex flex-col space-y-2">
                {/* 文章标题和日期行：水平布局，两端对齐 */}
                <div className="flex items-center justify-between">
                  {/* 文章标题：带下划线样式 */}
                  <h2 className="text-xl font-semibold underline underline-offset-4">
                    {blog.title}
                  </h2>
                  {/* 文章日期和字数：小号灰色文字 */}
                  <span className="text-sm text-gray-500">
                  {/* 格式化日期为中文格式，并计算文章字数 */}
                  {new Date(blog.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'numeric', 
                    day: 'numeric'
                  }).replace(/\//g, '年').replace(/\//g, '月') + '日'} · {count(blog.content)} 字
                  </span>
                </div>
                {/* 文章摘要：灰色文字，最多显示两行 */}
                <p className="text-gray-600 line-clamp-2">
                  {blog.summary}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}


