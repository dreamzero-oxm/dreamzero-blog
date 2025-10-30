import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Search, Plus, Edit, Trash2, Eye, EyeOff, FileText, X, Heart, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetArticles, useDeleteArticle, useUpdateArticleStatus } from '@/hooks/article-hook';
import type { Article, ListArticlesRequest } from '@/interface/article';
import { toast } from 'sonner';

interface ArticleListProps {
  onEdit?: (article: Article) => void;
  onView?: (article: Article) => void;
  onCreate?: () => void;
}

export default function ArticleList({ onEdit, onView, onCreate }: ArticleListProps) {
  const [searchParams, setSearchParams] = useState<ListArticlesRequest>({
    page: 1,
    page_size: 10,
    status: undefined,
    keyword: undefined,
    tag: undefined,
    tags: undefined,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data, isLoading, error, refetch } = useGetArticles({
    page: searchParams.page,
    page_size: searchParams.page_size,
    status: searchParams.status,
    keyword: searchParams.keyword,
    tag: searchParams.tag,
    tags: searchParams.tags,
  });
  const deleteArticleMutation = useDeleteArticle();
  const updateStatusMutation = useUpdateArticleStatus();

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await deleteArticleMutation.mutateAsync({ id });
        toast.success('文章删除成功');
        refetch();
      } catch {
        toast.error('文章删除失败');
      }
    }
  };

  const handleStatusChange = async (id: number, status: 'draft' | 'published' | 'private') => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success('文章状态更新成功');
      refetch();
    } catch {
      toast.error('文章状态更新失败');
    }
  };

  const handleSearch = () => {
    setSearchParams(prev => ({ 
      ...prev, 
      page: 1,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    }));
    refetch();
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()];
      setSelectedTags(newTags);
      setSearchParams(prev => ({ 
        ...prev, 
        page: 1,
        tags: newTags.length > 0 ? newTags : undefined
      }));
      setTagInput('');
      refetch();
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setSearchParams(prev => ({ 
      ...prev, 
      page: 1,
      tags: newTags.length > 0 ? newTags : undefined
    }));
    refetch();
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // 处理搜索输入防抖
  const [searchDebounce, setSearchDebounce] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams(prev => ({ ...prev, keyword: searchDebounce }));
      setSearchParams(prev => ({ ...prev, page: 1 }));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchDebounce]);
  
  // 处理状态筛选
  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setSearchParams(prev => ({ ...prev, status: undefined }));
    } else {
      setSearchParams(prev => ({ ...prev, status: status as 'draft' | 'published' | 'private' }));
    }
    setSearchParams(prev => ({ ...prev, page: 1 }));
  };
  
  // 处理标签筛选
  const handleTagFilter = (tag: string) => {
    if (tag === 'all') {
      setSearchParams(prev => ({ ...prev, tag: undefined }));
    } else {
      setSearchParams(prev => ({ ...prev, tag }));
    }
    setSearchParams(prev => ({ ...prev, page: 1 }));
  };
  
  // 获取所有标签
  const getAllTags = (articlesList: Article[]) => {
    const tags = new Set<string>();
    articlesList?.forEach(article => {
      article.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };
  
  // 生成分页数字
  const getPaginationNumbers = () => {
    const delta = 2; // 当前页前后显示的页数
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
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

  const articles = data?.data?.articles || [];
  const total = data?.data?.total || 0;
  const currentPage = searchParams.page || 1;
  const pageSize = searchParams.page_size || 10;
  const totalPages = Math.ceil(total / pageSize);
  const allTags = getAllTags(articles);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">文章管理</h2>
          <p className="text-muted-foreground">管理您的所有文章</p>
        </div>
        <Button onClick={onCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新建文章
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索文章标题"
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={searchParams.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="private">私密</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={searchParams.tag || 'all'}
              onValueChange={handleTagFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="标签" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部标签</SelectItem>
                {allTags.map((tag: string) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(searchParams.keyword || searchParams.status || searchParams.tag) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">当前筛选:</span>
              {searchParams.keyword && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  关键词: {searchParams.keyword}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSearchDebounce('');
                      setSearchParams(prev => ({ ...prev, keyword: undefined }));
                    }}
                  />
                </Badge>
              )}
              {searchParams.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  状态: {searchParams.status === 'draft' ? '草稿' : searchParams.status === 'published' ? '已发布' : '私密'}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleStatusFilter('all')}
                  />
                </Badge>
              )}
              {searchParams.tag && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  标签: {searchParams.tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleTagFilter('all')}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchDebounce('');
                  setSearchParams({ page: 1 });
                }}
              >
                清除所有筛选
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

          {isLoading ? (
            <div className="flex justify-center py-8">加载中...</div>
          ) : error ? (
            <div className="flex justify-center py-8 text-red-500">加载失败</div>
          ) : articles.length === 0 ? (
            <div className="flex justify-center py-8 text-muted-foreground">暂无文章</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">标题</TableHead>
                    <TableHead className="w-[100px]">状态</TableHead>
                    <TableHead className="w-[150px]">标签</TableHead>
                    <TableHead className="w-[80px] text-center">浏览量</TableHead>
                    <TableHead className="w-[80px] text-center">点赞数</TableHead>
                    <TableHead className="w-[80px] text-center">评论数</TableHead>
                    <TableHead className="w-[120px]">创建时间</TableHead>
                    <TableHead className="w-[150px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex flex-col space-y-1">
                          <div className="font-semibold truncate" title={article.title}>
                            {article.title}
                          </div>
                          {article.summary && (
                            <div className="text-sm text-muted-foreground truncate" title={article.summary}>
                              {article.summary}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(article.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {article.tags && article.tags.length > 0 ? (
                            article.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">无标签</span>
                          )}
                          {article.tags && article.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                          {article.view_count}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Heart className="h-4 w-4 mr-1 text-muted-foreground" />
                          {article.like_count}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 mr-1 text-muted-foreground" />
                          {article.comment_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(article.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onView?.(article)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit?.(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {article.status === 'published' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleStatusChange(article.id, 'draft')}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleStatusChange(article.id, 'published')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(article.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    共 {total} 篇文章，第 {currentPage} 页，共 {totalPages} 页
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {getPaginationNumbers().map((pageNum, index) => {
                        if (pageNum === '...') {
                          return (
                            <div key={`ellipsis-${index}`} className="px-3 py-1 text-sm text-muted-foreground">
                              ...
                            </div>
                          );
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum as number)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="flex items-center gap-1"
                    >
                      下一页
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
    </div>
  );
}