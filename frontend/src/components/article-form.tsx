'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { X, Save, Eye, Upload } from 'lucide-react';
import { useCreateArticle, useUpdateArticle } from '@/hooks/article-hook';
import type { Article, CreateArticleRequest, UpdateArticleRequest } from '@/interface/article';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

import { components } from '@/components/mdx-components';

interface ArticleFormProps {
  article?: Article;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function ArticleForm({ article, onSave, onCancel }: ArticleFormProps) {
  const [formData, setFormData] = useState<CreateArticleRequest | UpdateArticleRequest>({
    title: '',
    content: '',
    summary: '',
    status: 'draft',
    tags: [],
    cover_image: '',
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState('edit');
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formChangedRef = useRef(false);
  
  const createArticleMutation = useCreateArticle();
  const updateArticleMutation = useUpdateArticle();
  
  const isEditing = !!article;
  const isLoading = createArticleMutation.isPending || updateArticleMutation.isPending;
  
  const handleAutoSave = useCallback(async () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      return; // 标题或内容为空时不自动保存
    }
    
    try {
      if (isEditing) {
        await updateArticleMutation.mutateAsync({
          ...formData as UpdateArticleRequest,
          status: 'draft' // 自动保存时总是保存为草稿
        });
      } else {
        // 如果是新文章，创建一个草稿
        const result = await createArticleMutation.mutateAsync({
          ...formData as CreateArticleRequest,
          status: 'draft'
        });
        // 更新表单数据，添加新创建的文章ID
        if (result?.data?.id) {
          setFormData(prev => ({ ...prev, id: result.data.id }));
        }
      }
      setLastSaved(new Date());
      formChangedRef.current = false;
    } catch (error) {
      console.error('自动保存失败:', error);
    }
  }, [formData, isEditing, updateArticleMutation, createArticleMutation]);
  
  useEffect(() => {
    if (article) {
      setFormData({
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary,
        status: article.status,
        tags: article.tags,
        cover_image: article.cover_image || '',
      });
      setCoverImagePreview(article.cover_image || '');
    }
  }, [article]);
  
  // 自动保存草稿
  useEffect(() => {
    if (formChangedRef.current) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000); // 3秒后自动保存
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, handleAutoSave]);
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = '请输入文章标题';
    } else if (formData.title.length > 100) {
      newErrors.title = '标题不能超过100个字符';
    }
    
    if (!formData.content?.trim()) {
      newErrors.content = '请输入文章内容';
    }
    
    if (formData.summary && formData.summary.length > 200) {
      newErrors.excerpt = '摘要不能超过200个字符';
    }
    
    if (formData.tags && formData.tags.length > 10) {
      newErrors.tags = '标签数量不能超过10个';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    formChangedRef.current = true;
    
    // 清除该字段的错误信息
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // 如果是封面图片URL，更新预览
    if (field === 'cover_image') {
      setCoverImagePreview(value);
    }
  };
  
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCoverImagePreview(result);
        handleInputChange('cover_image', result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      if (formData.tags && formData.tags.length >= 10) {
        toast.error('标签数量不能超过10个');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
      formChangedRef.current = true;
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
    formChangedRef.current = true;
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditing) {
        await updateArticleMutation.mutateAsync(formData as UpdateArticleRequest);
        toast.success('文章更新成功');
      } else {
        await createArticleMutation.mutateAsync(formData as CreateArticleRequest);
        toast.success('文章创建成功');
      }
      onSave?.();
    } catch {
      toast.error(isEditing ? '文章更新失败' : '文章创建失败');
    }
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEditing ? '编辑文章' : '创建文章'}</CardTitle>
              <CardDescription>
                {isEditing ? '修改文章内容和设置' : '填写文章信息并发布'}
              </CardDescription>
            </div>
            {lastSaved && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Save className="h-4 w-4 mr-1" />
                已保存于 {format(lastSaved, 'HH:mm:ss')}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">编辑</TabsTrigger>
          <TabsTrigger value="preview">预览</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">文章标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="请输入文章标题"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.title?.length || 0}/100
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">文章摘要</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="请输入文章摘要"
                    rows={3}
                    className={errors.excerpt ? 'border-red-500' : ''}
                  />
                  {errors.excerpt && (
                    <p className="text-sm text-red-500">{errors.excerpt}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.summary?.length || 0}/200
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">文章内容</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="请输入文章内容"
                    rows={10}
                    className={errors.content ? 'border-red-500' : ''}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cover_image">封面图片</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        id="cover_image"
                        value={formData.cover_image}
                        onChange={(e) => handleInputChange('cover_image', e.target.value)}
                        placeholder="请输入封面图片URL"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="cover_image_upload"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button type="button" variant="outline" className="pointer-events-none">
                          <Upload className="h-4 w-4 mr-2" />
                          上传
                        </Button>
                      </div>
                    </div>
                    
                    {coverImagePreview && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">封面预览</p>
                        <div className="relative w-full h-48 rounded-md overflow-hidden border">
                          <Image
                            src={coverImagePreview}
                            alt="封面预览"
                            width={400}
                            height={200}
                            className="w-full h-full object-cover"
                            onError={() => {
                              toast.error('图片加载失败，请检查URL是否正确');
                              setCoverImagePreview('');
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="status">文章状态</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value as 'draft' | 'published' | 'private')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择文章状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">草稿</SelectItem>
                        <SelectItem value="published">已发布</SelectItem>
                        <SelectItem value="private">私密</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">文章标签</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        placeholder="输入标签后按回车添加"
                        className={errors.tags ? 'border-red-500' : ''}
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">
                        添加
                      </Button>
                    </div>
                    {errors.tags && (
                      <p className="text-sm text-red-500">{errors.tags}</p>
                    )}
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
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
                    <p className="text-xs text-muted-foreground">
                      {formData.tags?.length || 0}/10
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    取消
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('preview')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      预览
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? '保存中...' : (isEditing ? '更新' : '创建')}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-4">
                    {formData.title || '无标题'}
                  </h1>
                </div>
                
                {formData.summary && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">摘要</h3>
                    <p className="text-muted-foreground">{formData.summary}</p>
                  </div>
                )}
                
                {coverImagePreview && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">封面图片</h3>
                    <div className="relative overflow-hidden rounded-md">
                      <Image
                        src={coverImagePreview}
                        alt="封面图片"
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
                    <ReactMarkdown components={components}>
                      {formData.content || '暂无内容'}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}