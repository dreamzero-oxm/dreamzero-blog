/**
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/(manage)/manage/page.tsx
 * @description 文章管理页面组件，提供文章的增删改查功能
 * @mainFunctionality 管理文章列表，包括创建、编辑、查看和删除文章
 * @author DreamZero Team
 * @lastModified 2023-12-01
 */

'use client';

// 导入所需的依赖和组件
import { useState } from 'react'; // React状态管理Hook
import ArticleList from '@/components/article-list'; // 文章列表组件
import ArticleForm from '@/components/article-form'; // 文章表单组件
import ArticleView from '@/components/article-view'; // 文章查看组件
import type { Article } from '@/interface/article'; // 文章类型定义

// 定义视图模式类型
type ViewMode = 'list' | 'create' | 'edit' | 'view';

/**
 * @description 文章管理页面组件
 * @component ManagePage
 * @returns {JSX.Element} 返回文章管理页面的JSX结构
 * 
 * 页面功能：
 * - 显示文章列表
 * - 创建新文章
 * - 编辑现有文章
 * - 查看文章详情
 * - 处理不同视图模式之间的切换
 */
export default function ManagePage() {
  // 视图模式状态：控制显示列表、创建、编辑或查看模式
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  // 选中的文章状态：存储当前操作的文章
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  /**
   * @description 处理创建文章事件
   * 清空选中的文章并切换到创建模式
   */
  const handleCreateArticle = () => {
    setSelectedArticle(null);
    setViewMode('create');
  };
  
  /**
   * @description 处理编辑文章事件
   * @param article 要编辑的文章对象
   * 设置选中的文章并切换到编辑模式
   */
  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setViewMode('edit');
  };
  
  /**
   * @description 处理查看文章事件
   * @param article 要查看的文章对象
   * 设置选中的文章并切换到查看模式
   */
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
    setViewMode('view');
  };
  
  /**
   * @description 处理返回列表事件
   * 切换到列表模式并清空选中的文章
   */
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedArticle(null);
  };
  
  /**
   * @description 处理保存文章事件
   * 保存后返回列表模式并清空选中的文章
   */
  const handleSaveArticle = () => {
    // setViewMode('list');
    // setSelectedArticle(null);
  };
  
  return (
    <div className="w-full overflow-x-hidden">
      {viewMode === 'list' && (
        <ArticleList
          onCreate={handleCreateArticle}
          onEdit={handleEditArticle}
          onView={handleViewArticle}
        />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="w-full overflow-x-hidden">
          <ArticleForm
            article={selectedArticle || undefined}
            onSave={handleSaveArticle}
            onCancel={handleBackToList}
          />
        </div>
      )}

      {viewMode === 'view' && selectedArticle && (
        <div className="w-full overflow-x-hidden">
          <ArticleView
            articleId={selectedArticle.id}
            onBack={handleBackToList}
            onEdit={handleEditArticle}
          />
        </div>
      )}
    </div>
  );
}