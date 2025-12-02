'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetArticle } from '@/hooks/article-hook';
import { formatDate } from '@/utils/date';
import { useEffect, Suspense, useState, useCallback } from 'react';
import MarkdownWithTOC from '@/components/markdown-with-toc';
import TableOfContents, { Heading } from '@/components/table-of-contents';

function ArticleDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [headings, setHeadings] = useState<Heading[]>([]);
  
  // 使用 useCallback 包装 setHeadings，避免无限循环
  const handleHeadingsExtracted = useCallback((extractedHeadings: Heading[]) => {
    setHeadings(extractedHeadings);
  }, []);

  // 如果没有ID，重定向到文章列表
  useEffect(() => {
    if (!id) {
      router.push('/articles');
    }
  }, [id, router]);

  // 获取文章详情
  const { data: articleResponse, isLoading, error } = useGetArticle(id || '');
  const article = articleResponse?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">加载文章失败: {error.message}</div>
      </div>
    );
  }

  if (!articleResponse?.data || !article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文章不存在</h1>
          <p className="text-gray-600 mb-6">抱歉，您访问的文章不存在或已被删除。</p>
          <Link href="/articles" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            返回文章列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* 主内容区域 */}
          <div className="flex-1 min-w-0 xl:max-w-4xl">
            {/* 返回按钮 */}
            <button
              onClick={() => router.back()}
              className="mb-4 sm:mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回文章列表
            </button>

            {/* 文章内容 */}
            <article className="bg-card rounded-lg shadow-sm sm:shadow-md overflow-hidden">
              {/* 文章封面 */}
              {article.cover_image && (
                <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96">
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 sm:p-6 md:p-8">
                {/* 文章标题 */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight break-words">
                  {article.title}
                </h1>

                {/* 文章元信息 */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  <div className="flex items-center">
                    <span className="mr-1">发布时间:</span>
                    <span className="font-medium">{formatDate(article.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">浏览量:</span>
                    <span className="font-medium">{article.view_count}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">点赞数:</span>
                    <span className="font-medium">{article.like_count}</span>
                  </div>
                </div>

                {/* 文章标签 */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                    {article.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-muted text-muted-foreground rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 文章摘要 */}
                {article.summary && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted rounded-lg">
                    <h3 className="text-base sm:text-lg font-semibold text-muted-foreground mb-2">摘要</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">{article.summary}</p>
                  </div>
                )}

                {/* 文章正文 */}
                <div className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground custom-scrollbar">
                  <MarkdownWithTOC
                    content={article.content || '暂无内容'}
                    onHeadingsExtracted={handleHeadingsExtracted}
                  />
                </div>
              </div>
            </article>
          </div>

          {/* 右侧目录导航 - 只在大屏幕显示 */}
          <aside className="hidden xl:block w-60 lg:w-64 flex-shrink-0 sticky top-8 h-fit">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function ArticleDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"></div>
      </div>
    }>
      <ArticleDetailContent />
    </Suspense>
  );
}