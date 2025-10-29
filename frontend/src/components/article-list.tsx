import { useState } from 'react';
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
import { Search, Plus, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
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
    keyword: '',
  });

  const { data, isLoading, error, refetch } = useGetArticles(searchParams);
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
    setSearchParams(prev => ({ ...prev, page: 1 }));
    refetch();
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>文章管理</CardTitle>
              <CardDescription>管理您的所有文章</CardDescription>
            </div>
            <Button onClick={onCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新建文章
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文章标题..."
                className="pl-8"
                value={searchParams.keyword}
                onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select
              value={searchParams.status || 'all'}
              onValueChange={(value) => setSearchParams(prev => ({ 
                ...prev, 
                status: value === 'all' ? undefined : value as 'draft' | 'published' | 'private'
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="private">私密</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>搜索</Button>
          </div>

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
                    <TableHead>标题</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>浏览量</TableHead>
                    <TableHead>点赞数</TableHead>
                    <TableHead>评论数</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-[200px] truncate" title={article.title}>
                          {article.title}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell>{article.view_count}</TableCell>
                      <TableCell>{article.like_count}</TableCell>
                      <TableCell>{article.comment_count}</TableCell>
                      <TableCell>
                        {format(new Date(article.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView?.(article)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {article.status === 'published' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(article.id, 'draft')}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(article.id, 'published')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
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
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}