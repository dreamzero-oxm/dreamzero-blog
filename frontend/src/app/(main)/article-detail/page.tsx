'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetArticle } from '@/hooks/article-hook';
import { formatDate } from '@/utils/date';
import { useEffect, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import { components } from '@/components/mdx-components';

function ArticleDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回文章列表
        </button>

        {/* 文章内容 */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 文章封面 */}
          {article.cover_image && (
            <div className="w-full h-64 md:h-96">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* 文章标题 */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {/* 文章元信息 */}
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6">
              <span className="mr-4">发布时间: {formatDate(article.created_at)}</span>
              <span className="mr-4">浏览量: {article.view_count}</span>
              <span className="mr-4">点赞数: {article.like_count}</span>
              {/* <span>作者: {article.user?.nickname}</span> */}
            </div>

            {/* 文章标签 */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 文章摘要 */}
            {article.summary && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">摘要</h3>
                <p className="text-gray-700">{article.summary}</p>
              </div>
            )}

            {/* 文章正文 */}
            <div className="prose prose-lg max-w-none">
              {/* <div dangerouslySetInnerHTML={{ __html: article.content || '' }} /> */}
              <ReactMarkdown components={components}>
                {article.content || '暂无内容'}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function ArticleDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ArticleDetailContent />
    </Suspense>
  );
}