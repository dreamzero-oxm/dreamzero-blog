'use client';

import { useState } from 'react';
import ArticleList from '@/components/article-list';
import ArticleForm from '@/components/article-form';
import ArticleView from '@/components/article-view';
import type { Article } from '@/interface/article';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function ManagePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  const handleCreateArticle = () => {
    setSelectedArticle(null);
    setViewMode('create');
  };
  
  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setViewMode('edit');
  };
  
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
    setViewMode('view');
  };
  
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedArticle(null);
  };
  
  const handleSaveArticle = () => {
    setViewMode('list');
    setSelectedArticle(null);
  };
  
  return (
    <div className="container mx-auto ">
      {viewMode === 'list' && (
        <ArticleList
          onCreate={handleCreateArticle}
          onEdit={handleEditArticle}
          onView={handleViewArticle}
        />
      )}
      
      {(viewMode === 'create' || viewMode === 'edit') && (
        <ArticleForm
          article={selectedArticle || undefined}
          onSave={handleSaveArticle}
          onCancel={handleBackToList}
        />
      )}
      
      {viewMode === 'view' && selectedArticle && (
        <ArticleView
          articleId={selectedArticle.id}
          onBack={handleBackToList}
          onEdit={handleEditArticle}
        />
      )}
    </div>
  );
}