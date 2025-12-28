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
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, EyeOff, FileText, X, Heart, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useDeleteArticle, useUpdateArticleStatus } from '@/hooks/article-hook';
import { useGetArticlesByRole, type GetArticlesByRoleRequest } from '@/hooks/article-hook';
import type { Article } from '@/interface/article';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

// 过滤无效参数的辅助函数
function filterParams(params: GetArticlesByRoleRequest): GetArticlesByRoleRequest {
  const filtered: GetArticlesByRoleRequest = {};
  
  // 处理基本参数
  if (params.page !== undefined && params.page !== null) {
    filtered.page = params.page;
  }
  if (params.page_size !== undefined && params.page_size !== null) {
    filtered.page_size = params.page_size;
  }
  
  // 处理字符串参数，过滤掉undefined、null和空字符串
  if (params.status !== undefined && params.status !== null && params.status !== '') {
    filtered.status = params.status;
  }
  if (params.tag !== undefined && params.tag !== null && params.tag !== '') {
    filtered.tag = params.tag;
  }
  if (params.title !== undefined && params.title !== null && params.title !== '') {
    filtered.title = params.title;
  }
  
  // 处理数组参数
  if (params.tags !== undefined && params.tags !== null && Array.isArray(params.tags) && params.tags.length > 0) {
    filtered.tags = params.tags;
  }
  
  // 确保排序参数有默认值
  filtered.sort_by = params.sort_by || 'created_at';
  filtered.sort_dir = params.sort_dir || 'desc';
  
  return filtered;
}

interface ArticleListProps {
  onEdit?: (article: Article) => void;
  onView?: (article: Article) => void;
  onCreate?: () => void;
}

export default function ArticleList({ onEdit, onView, onCreate }: ArticleListProps) {
  const [searchParams, setSearchParams] = useState<GetArticlesByRoleRequest>({
    page: 1,
    page_size: 10,
    status: undefined,
    tag: undefined,
    tags: undefined,
    title: undefined,
    sort_by: 'created_at',
    sort_dir: 'desc'
  });
  
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  
  // 防抖版本的搜索参数
  const [debouncedParams, setDebouncedParams] = useState<GetArticlesByRoleRequest>(searchParams);
  
  // 当searchParams变化时，使用防抖更新debouncedParams
  const updateDebouncedParams = useDebounce((params: GetArticlesByRoleRequest) => {
    setDebouncedParams(params);
  }, 400);
  
  // 监听searchParams变化，触发防抖更新
  useEffect(() => {
    updateDebouncedParams(searchParams);
  }, [searchParams, updateDebouncedParams]);

  const { data, isLoading, error, refetch } = useGetArticlesByRole(
    filterParams(debouncedParams)
  );
  const deleteArticleMutation = useDeleteArticle();
  const updateStatusMutation = useUpdateArticleStatus();

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await deleteArticleMutation.mutateAsync({ id });
        toast.success('文章删除成功');
        // 删除操作不需要防抖，立即更新
        setDebouncedParams(filterParams(searchParams));
      } catch {
        toast.error('文章删除失败');
      }
    }
  };

  const handleStatusChange = async (id: string, status: 'draft' | 'published' | 'private') => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success('文章状态更新成功');
      // 状态更新不需要防抖，立即更新
      setDebouncedParams(filterParams(searchParams));
    } catch {
      toast.error('文章状态更新失败');
    }
  };

  const handleSearch = () => {
    // 点击搜索按钮时立即更新防抖参数，不使用防抖
    setDebouncedParams(filterParams(searchParams));
  };

  // 处理标题输入变化，防抖逻辑已移到参数层面
  const handleTitleChange = (title: string) => {
    setSearchParams(prev => ({
      ...prev,
      page: 1,
      title,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    }));
  };

  const handlePageChange = (page: number) => {
    const newParams = { ...searchParams, page, title: searchParams.title };
    setSearchParams(newParams);
    // 分页变化不需要防抖，立即更新
    setDebouncedParams(filterParams(newParams));
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()];
      setSelectedTags(newTags);
      const newParams = {
        ...searchParams,
        page: 1,
        tags: newTags.length > 0 ? newTags : undefined,
        title: searchParams.title
      };
      setSearchParams(newParams);
      setTagInput('');
      // 标签变化不需要防抖，立即更新
      setDebouncedParams(filterParams(newParams));
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    const newParams = {
      ...searchParams,
      page: 1,
      tags: newTags.length > 0 ? newTags : undefined,
      title: searchParams.title
    };
    setSearchParams(newParams);
    // 标签变化不需要防抖，立即更新
    setDebouncedParams(filterParams(newParams));
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  

  
  // 处理状态筛选
  const handleStatusFilter = (status: string) => {
    let newParams;
    if (status === 'all') {
      newParams = { ...searchParams, status: undefined, page: 1, title: searchParams.title };
    } else {
      newParams = { ...searchParams, status: status as 'draft' | 'published' | 'private', page: 1, title: searchParams.title };
    }
    setSearchParams(newParams);
    // 状态筛选不需要防抖，立即更新
    setDebouncedParams(filterParams(newParams));
  };
  
  // 处理标签筛选
  const handleTagFilter = (tag: string) => {
    let newParams;
    if (tag === 'all') {
      setSelectedTags([]);
      newParams = { 
        ...searchParams, 
        tag: undefined,
        tags: undefined,
        page: 1,
        title: searchParams.title
      };
    } else {
      // 如果标签不在已选标签中，则添加
      if (!selectedTags.includes(tag)) {
        const newTags = [...selectedTags, tag];
        setSelectedTags(newTags);
        newParams = { 
          ...searchParams, 
          tag: undefined, // 不再使用单个tag参数
          tags: newTags,
          page: 1,
          title: searchParams.title
        };
      } else {
        // 如果标签已在已选标签中，不做任何操作
        return;
      }
    }
    setSearchParams(newParams);
    // 标签筛选不需要防抖，立即更新
    setDebouncedParams(filterParams(newParams));
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
  
  // 切换文章摘要展开/收起状态
  const toggleArticleExpansion = (articleId: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };
  
  // 处理排序字段变化
  const handleSortByChange = (value: string) => {
    const newParams = { ...searchParams, sort_by: value, page: 1, title: searchParams.title };
    setSearchParams(newParams);
    // 排序变化不需要防抖，立即更新
    setDebouncedParams(filterParams(newParams));
  };
  
  // 处理排序方向变化
  const handleSortDirChange = (value: 'asc' | 'desc') => {
    const newParams = { ...searchParams, sort_dir: value, page: 1, title: searchParams.title };
    setSearchParams(newParams);
    // 排序方向变化不需要防抖，立即更新
    setDebouncedParams(filterParams(newParams));
  };
  
  // const handlePageSizeChange = (pageSize: number) => {
  //   const newParams = { ...searchParams, page_size: pageSize, page: 1, title: searchParams.title };
  //   setSearchParams(newParams);
  //   // 页面大小变化不需要防抖，立即更新
  //   setDebouncedParams(filterParams(newParams));
  // };
  
  // const handleSort = (sortBy: string) => {
  //   const newParams = {
  //     ...searchParams,
  //     page: 1,
  //     sort_by: sortBy as 'created_at' | 'updated_at' | 'title' | 'view_count' | 'like_count',
  //     sort_dir: searchParams.sort_by === sortBy && searchParams.sort_dir === 'desc' ? 'asc' : 'desc',
  //     title: searchParams.title
  //   };
  //   setSearchParams(newParams);
  //   // 排序变化不需要防抖，立即更新
  //   setDebouncedParams(filterParams(newParams));
  // };
  
  const allTags = getAllTags(articles);

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">文章管理</h2>
          <p className="text-sm sm:text-base text-muted-foreground">管理您的所有文章</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2 text-sm sm:text-base"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">刷新</span>
            <span className="sm:hidden">刷新</span>
          </Button>
          <Button
            onClick={onCreate}
            className="flex items-center gap-2 text-sm sm:text-base"
            size="sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">新建文章</span>
            <span className="sm:hidden">新建</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="搜索文章标题"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchParams.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch}>搜索</Button>
              <Select value={searchParams.sort_by || 'created_at'} onValueChange={handleSortByChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="排序字段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">创建时间</SelectItem>
                  <SelectItem value="updated_at">更新时间</SelectItem>
                  <SelectItem value="title">标题</SelectItem>
                  <SelectItem value="view_count">浏览次数</SelectItem>
                  <SelectItem value="like_count">点赞次数</SelectItem>
                  <SelectItem value="published_at">发布时间</SelectItem>
                </SelectContent>
              </Select>
              <Select value={searchParams.sort_dir || 'desc'} onValueChange={handleSortDirChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="排序方向" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">升序</SelectItem>
                  <SelectItem value="desc">降序</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="添加标签"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
              />
              <Button onClick={handleAddTag}>添加</Button>
            </div>
          </div>
          
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              value={selectedTags.length > 0 ? selectedTags[0] : 'all'}
              onValueChange={handleTagFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择标签（可多选）">
                  {selectedTags.length > 1 
                    ? `已选择 ${selectedTags.length} 个标签` 
                    : selectedTags.length === 1 
                      ? selectedTags[0] 
                      : '选择标签（可多选）'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部标签</SelectItem>
                {allTags.map((tag: string) => (
                  <SelectItem 
                    key={tag} 
                    value={tag}
                    className={selectedTags.includes(tag) ? 'bg-accent' : ''}
                  >
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(searchParams.status || searchParams.tag || (searchParams.tags && searchParams.tags.length > 0)) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">当前筛选:</span>
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
              {searchParams.tags && searchParams.tags.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  标签: {searchParams.tags.join(', ')}
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
                  setSearchParams(prev => ({ 
                    ...prev, 
                    status: undefined, 
                    tag: undefined,
                    page: 1 
                  }));
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
            <div className="rounded-md border overflow-x-auto">
              <Table className="article-list-table w-full min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">标题</TableHead>
                    <TableHead className="min-w-[80px] sm:min-w-[100px] text-center">状态</TableHead>
                    <TableHead className="min-w-[100px] sm:min-w-[150px] text-center">标签</TableHead>
                    <TableHead className="min-w-[60px] text-center">浏览量</TableHead>
                    <TableHead className="min-w-[60px] text-center">点赞数</TableHead>
                    <TableHead className="min-w-[100px] sm:min-w-[120px] text-center">创建时间</TableHead>
                    <TableHead className="min-w-[100px] sm:min-w-[150px] text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article: Article) => (
                    <TableRow key={article.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium w-[200px] sm:w-[250px] max-w-[250px] min-w-[150px] overflow-hidden">
                        <div className="flex flex-col space-y-1 w-full">
                          <div className="article-title-truncate max-w-[200px] sm:max-w-[250px]" title={article.title}>
                            {article.title}
                          </div>
                          {article.summary && (
                            <div className="text-sm text-muted-foreground">
                              <div className={expandedArticles.has(article.id) ? '' : 'article-title-truncate'} title={article.summary}>
                                {article.summary}
                              </div>
                              <button
                                onClick={() => toggleArticleExpansion(article.id)}
                                className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                              >
                                {expandedArticles.has(article.id) ? '收起' : '展开'}
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          {getStatusBadge(article.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {article.tags && article.tags.length > 0 ? (
                            article.tags.slice(0, 2).map((tag: string, index: number) => (
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
                      <TableCell className="text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-muted-foreground" />
                          <span className="text-xs sm:hidden">{article.view_count}</span>
                          <span className="hidden sm:inline">{article.view_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center">
                          <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-muted-foreground" />
                          <span className="text-xs sm:hidden">{article.like_count}</span>
                          <span className="hidden sm:inline">{article.like_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(article.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="article-actions">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 sm:h-8 sm:w-8"
                            onClick={() => onView?.(article)}
                          >
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:hidden">查看</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 sm:h-8 sm:w-8"
                            onClick={() => onEdit?.(article)}
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:hidden">编辑</span>
                          </Button>
                          {article.status === 'published' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-8 sm:w-8"
                              onClick={() => handleStatusChange(article.id, 'draft')}
                            >
                              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:hidden">隐藏</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-8 sm:w-8"
                              onClick={() => handleStatusChange(article.id, 'published')}
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:hidden">发布</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(article.id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:hidden">删除</span>
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
                      {getPaginationNumbers().map((pageNum: number | string, index: number) => {
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