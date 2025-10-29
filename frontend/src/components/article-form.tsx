import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useCreateArticle, useUpdateArticle } from '@/hooks/article-hook';
import type { Article, CreateArticleRequest, UpdateArticleRequest } from '@/interface/article';
import { toast } from 'sonner';

interface ArticleFormProps {
  article?: Article;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function ArticleForm({ article, onSave, onCancel }: ArticleFormProps) {
  const [formData, setFormData] = useState<CreateArticleRequest | UpdateArticleRequest>({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    tags: [],
    cover_image: '',
  });
  
  const [tagInput, setTagInput] = useState('');
  
  const createArticleMutation = useCreateArticle();
  const updateArticleMutation = useUpdateArticle();
  
  const isEditing = !!article;
  const isLoading = createArticleMutation.isPending || updateArticleMutation.isPending;
  
  useEffect(() => {
    if (article) {
      setFormData({
        id: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        status: article.status,
        tags: article.tags,
        cover_image: article.cover_image || '',
      });
    }
  }, [article]);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      toast.error('请输入文章标题');
      return;
    }
    
    if (!formData.content?.trim()) {
      toast.error('请输入文章内容');
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? '编辑文章' : '创建文章'}</CardTitle>
        <CardDescription>
          {isEditing ? '修改文章内容和设置' : '填写文章信息并发布'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">文章标题</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="请输入文章标题"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excerpt">文章摘要</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="请输入文章摘要"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">文章内容</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="请输入文章内容"
              rows={10}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cover_image">封面图片URL</Label>
            <Input
              id="cover_image"
              value={formData.cover_image}
              onChange={(e) => handleInputChange('cover_image', e.target.value)}
              placeholder="请输入封面图片URL"
            />
          </div>
          
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
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                添加
              </Button>
            </div>
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
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : (isEditing ? '更新' : '创建')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}