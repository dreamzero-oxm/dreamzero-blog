import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Eye, EyeOff, Trash2, Heart, MessageCircle, Eye as ViewIcon } from 'lucide-react';
import { useGetArticle, useUpdateArticleStatus, useDeleteArticle, useLikeArticle } from '@/hooks/article-hook';
import type { Article } from '@/interface/article';
import { toast } from 'sonner';

interface ArticleViewProps {
  articleId: number;
  onBack?: () => void;
  onEdit?: (article: Article) => void;
}

export default function ArticleView({ articleId, onBack, onEdit }: ArticleViewProps) {
  const { data, isLoading, error, refetch } = useGetArticle(articleId);
  const updateStatusMutation = useUpdateArticleStatus();
  const deleteArticleMutation = useDeleteArticle();
  const likeArticleMutation = useLikeArticle();
  
  const article = data?.data;
  
  const handleStatusChange = async (status: 'draft' | 'published' | 'private') => {
    if (!article) return;
    
    try {
      await updateStatusMutation.mutateAsync({ id: article.id, status });
      toast.success('文章状态更新成功');
      refetch();
    } catch {
      toast.error('文章状态更新失败');
    }
  };
  
  const handleDelete = async () => {
    if (!article) return;
    
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await deleteArticleMutation.mutateAsync({ id: article.id });
        toast.success('文章删除成功');
        onBack?.();
      } catch {
        toast.error('文章删除失败');
      }
    }
  };
  
  const handleLike = async () => {
    if (!article) return;
    
    try {
      await likeArticleMutation.mutateAsync({ id: article.id });
      toast.success('点赞成功');
      refetch();
    } catch {
      toast.error('点赞失败');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">草稿</Badge>;
      case 'published':
        return <Badge variant="default">已发布</Badge>;
      case 'private':
        return <Badge variant="outline">私密</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div>加载中...</div>
      </div>
    );
  }
  
  if (error || !article) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-500">加载失败</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(article)}>
            <Edit className="h-4 w-4" />
          </Button>
          
          {article.status === 'published' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange('draft')}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusChange('published')}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{article.title}</CardTitle>
              <CardDescription>
                创建于 {format(new Date(article.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                {article.updated_at !== article.created_at && (
                  <span>
                    ，更新于 {format(new Date(article.updated_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                  </span>
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(article.status)}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ViewIcon className="h-4 w-4" />
                  {article.view_count}
                </div>
                
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {article.like_count}
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {article.comment_count}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {article.excerpt && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-2">摘要</h3>
                <p className="text-muted-foreground">{article.excerpt}</p>
              </div>
              
              <Separator />
            </>
          )}
          
          {article.cover_image && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-2">封面图片</h3>
                <img 
                  src={article.cover_image} 
                  alt={article.title}
                  className="max-w-full h-auto rounded-md"
                />
              </div>
              
              <Separator />
            </>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">内容</h3>
            <div className="prose max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <>
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleLike}
              disabled={likeArticleMutation.isPending}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              点赞
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}