'use client'
import { useState } from 'react';
import Link from 'next/link';
import { useGetArticles } from '@/hooks/article-hook';
import { Article } from '@/interface/article';
import { formatDate } from '@/utils/date';

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 获取文章列表
  const { data: articlesResponse, isLoading, error } = useGetArticles({
    page,
    page_size: pageSize,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // 获取推荐文章（最近发布的文章）
  const { data: recommendedResponse } = useGetArticles({
    page: 1,
    page_size: 5,
    sort_by: 'like_count',
    sort_order: 'desc',
  });

  const articles = articlesResponse?.data;
  const recommendedArticles = recommendedResponse?.data;
  const totalPages = articles ? Math.ceil(articles.total / pageSize) : 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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

  return (
    <div className="bg-gray-50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-background">
          {/* 文章列表 */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">文章列表</h1>
            
            {articles?.articles && articles.articles.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {articles.articles.map((article: Article) => (
                    <Link href={`/article-detail?id=${article.id}`} key={article.id} className="hover:text-blue-600 transition-colors">
                      <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {article.title}
                        </h2>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {article.summary}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          {/* <span className="mr-4">作者: {article.user?.nickname}</span> */}
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
                  ))}
                </div>

            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">暂无文章</p>
              </div>
            )}
            
            {/* 分页 */}
            {totalPages > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pageNum
                          ? 'text-white bg-blue-600'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </nav>
              </div>
            )}
          </div>
          
          {/* 推荐阅读 */}
          <div className="lg:col-span-1 h-full flex flex-col justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md ">
              <h3 className="text-lg font-bold text-gray-900 mb-4">推荐阅读</h3>
              {recommendedArticles && recommendedArticles.articles.length > 0 ? (
                <div className="space-y-4">
                  {recommendedArticles.articles.map((article: Article) => (
                    <Link key={article.id} href={`/article-detail?id=${article.id}`} className="hover:text-blue-600 transition-colors">
                      <div className="pb-4 border-b border-gray-200 last:border-0">
                        <h4 className="text-base font-medium text-gray-900 mb-1">
                            {article.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(article.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">暂无推荐文章</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}