import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Eye, EyeOff, Trash2, Heart, Eye as ViewIcon, Share2, Clock, BarChart3, Check } from 'lucide-react';
import { useGetArticle, useUpdateArticleStatus, useDeleteArticle, useLikeArticle } from '@/hooks/article-hook';
import type { Article } from '@/interface/article';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleViewProps {
  articleId: string;
  onBack?: () => void;
  onEdit?: (article: Article) => void;
}

export default function ArticleView({ articleId, onBack, onEdit }: ArticleViewProps) {
  const { data, isLoading, error, refetch } = useGetArticle(articleId);
  const updateStatusMutation = useUpdateArticleStatus();
  const deleteArticleMutation = useDeleteArticle();
  const likeArticleMutation = useLikeArticle();
  
  const article = data?.data;
  const [copied, setCopied] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  
  // 计算阅读时间（假设每分钟阅读200字）
  useEffect(() => {
    if (article?.content) {
      const wordCount = article.content.length;
      const minutes = Math.ceil(wordCount / 200);
      setReadingTime(minutes);
    }
  }, [article]);
  
  // 分享功能
  const handleShare = async () => {
    if (!article) return;
    
    const shareUrl = `${window.location.origin}/article/${article.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary || article.title,
          url: shareUrl,
        });
        toast.success('分享成功');
      } catch (error) {
        console.error('分享失败:', error);
      }
    } else {
      // 复制链接到剪贴板
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('链接已复制到剪贴板');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('复制链接失败:', error);
        toast.error('复制链接失败');
      }
    }
  };
  
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
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? '已复制' : '分享'}</p>
              </TooltipContent>
            </Tooltip>
            
            <Button variant="ghost" size="sm" onClick={() => onEdit?.(article)}>
              <Edit className="h-4 w-4" />
            </Button>
            
            {article.status === 'published' ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange('draft')}
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>下架</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange('published')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>发布</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>删除</p>
              </TooltipContent>
            </Tooltip>
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
                <span className="flex items-center gap-1 ml-2">
                  <Clock className="h-3 w-3" />
                  预计阅读时间: {readingTime} 分钟
                </span>
              </CardDescription>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(article.status)}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1">
                      <ViewIcon className="h-4 w-4" />
                      {article.view_count}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>浏览量</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {article.like_count}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>点赞数</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {article.comment_count}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>评论数</p>
                  </TooltipContent>
                </Tooltip> */}
              </div>
            </div>
          </div>
          
          {/* 统计信息可视化 */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">文章统计</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>浏览量</span>
                  <span>{article.view_count}</span>
                </div>
                <Progress value={Math.min((article.view_count / 1000) * 100, 100)} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>点赞数</span>
                  <span>{article.like_count}</span>
                </div>
                <Progress value={Math.min((article.like_count / 100) * 100, 100)} className="h-2" />
              </div>
              {/* <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>评论数</span>
                  <span>{article.comment_count}</span>
                </div>
                <Progress value={Math.min((article.comment_count / 50) * 100, 100)} className="h-2" />
              </div> */}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {article.summary && (
            <div>
              <h3 className="text-lg font-medium mb-2">摘要</h3>
              <p className="text-muted-foreground">{article.summary}</p>
            </div>
          )}
          
          {article.cover_image && (
            <div>
              <h3 className="text-lg font-medium mb-2">封面图片</h3>
              <div className="relative overflow-hidden rounded-md">
                <Image
                  src={article.cover_image}
                  alt={article.title}
                  width={800}
                  height={400}
                  className="w-full max-h-96 object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-4">内容</h3>
            <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            </div>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">标签</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="hover:bg-secondary/80 transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={article.is_liked ? "default" : "outline"}
                  onClick={handleLike}
                  disabled={likeArticleMutation.isPending}
                  className="flex items-center gap-2 transition-all"
                >
                  <Heart className={`h-4 w-4 ${article.is_liked ? 'fill-current' : ''}`} />
                  {article.is_liked ? '已点赞' : '点赞'} ({article.like_count})
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{article.is_liked ? '取消点赞' : '点赞这篇文章'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
}