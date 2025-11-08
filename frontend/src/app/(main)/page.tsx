'use client'

/**
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/(main)/page.tsx
 * @description 网站主页组件，展示个人简介、精选博客和技术栈
 * @mainFunctionality 展示个人简介、精选博客文章和技术栈徽章
 * @author DreamZero Team
 * @lastModified 2023-12-01
 */

// 导入所需的依赖和组件
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link"; // 导入Next.js的Link组件，用于客户端导航
import { config } from "@/lib/config"; // 导入网站配置信息
import { Badge } from "@/components/ui/badge"; // 导入UI徽章组件
import { useGetArticles } from '@/hooks/article-hook';
import { Article } from '@/interface/article';
import { formatDate } from '@/utils/date';
import { debounce } from 'lodash';

/**
 * @description 网站主页组件
 * @component Home
 * @returns {JSX.Element} 返回主页的JSX结构
 * 
 * 页面功能：
 * - 展示个人简介和技术栈
 * - 显示推荐文章（通过API获取）
 * - 实现分页加载和懒加载
 * - 提供文章导航链接
 */
export default function Home() {
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastArticleRef = useRef<HTMLDivElement | null>(null);
  
  const pageSize = 10;

  // 获取推荐文章
  const { data: articlesResponse, isLoading, error: fetchError } = useGetArticles({
    page,
    page_size: pageSize,
    sort_by: 'like_count',
    sort_order: 'desc',
  });

  // 更新文章列表
  useEffect(() => {
    if (articlesResponse?.data) {
      const newArticles = articlesResponse.data.articles;
      
      if (page === 1) {
        // 第一页，替换所有文章
        setArticles(newArticles);
      } else {
        // 后续页面，追加文章
        setArticles(prev => [...prev, ...newArticles]);
      }
      
      // 检查是否还有更多数据
      const total = articlesResponse.data.total;
      const loadedCount = page * pageSize;
      setHasMore(loadedCount < total);
      setIsLoadingMore(false);
    }
  }, [articlesResponse, page]);

  // 处理错误
  useEffect(() => {
    if (fetchError) {
      setError(fetchError.message);
    }
  }, [fetchError]);

  // 防抖加载更多
  const loadMore = useCallback(
    debounce(() => {
      if (!isLoadingMore && hasMore) {
        setIsLoadingMore(true);
        setPage(prev => prev + 1);
      }
    }, 300),
    [isLoadingMore, hasMore]
  );

  // 设置Intersection Observer实现懒加载
  useEffect(() => {
    if (isLoadingMore || !hasMore) return;

    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (lastArticleRef.current) {
      observer.current.observe(lastArticleRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoadingMore, hasMore, loadMore]);

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

      {/* 推荐文章列表部分 */}
      <div className="space-y-4 flex-1">
        <h2 className="text-2xl font-bold mb-8">推荐阅读</h2>
        
        {/* 加载状态 */}
        {isLoading && page === 1 && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* 错误状态 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p>加载文章失败: {error}</p>
            <button 
              onClick={() => {
                setError(null);
                setPage(1);
              }}
              className="mt-2 text-sm underline"
            >
              重试
            </button>
          </div>
        )}
        
        {/* 文章列表 */}
        {!isLoading && !error && (
          <div className="space-y-8">
            {articles.length > 0 ? (
              articles.map((article: Article, index: number) => (
                <article 
                  key={article.id} 
                  ref={index === articles.length - 1 ? lastArticleRef : null}
                  className=""
                >
                  <Link href={`/article-detail?id=${article.id}`}>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold underline underline-offset-4">
                          {article.title}
                        </h2>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <span className="mr-4">发布时间: {formatDate(article.created_at)}</span>
                        <span className="mr-4">浏览量: {article.view_count}</span>
                        <span>点赞数: {article.like_count}</span>
                      </div>
                      
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              ))
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">暂无推荐文章</p>
              </div>
            )}
            
            {/* 加载更多指示器 */}
            {isLoadingMore && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            )}
            
            {/* 没有更多数据提示 */}
            {!hasMore && articles.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                已加载全部文章
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
