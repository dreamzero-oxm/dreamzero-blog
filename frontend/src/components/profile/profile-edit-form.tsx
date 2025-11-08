'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUploadAvatar } from '@/hooks/user-hook';
import { UserProfile } from '@/interface/user';
import { Camera, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { createValidator, validateImageFile } from '@/lib/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProfileEditFormProps {
  profile?: UserProfile;
  onSubmit: (data: Partial<UserProfile>) => void;
  isLoading?: boolean;
}

export default function ProfileEditForm({ profile, onSubmit, isLoading = false }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    nickname: '',
    email: '',
    bio: '',
    avatar: '',
    phone: '',
    gender: '',
    birthday: '',
    location: '',
    website: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  // 分离网站协议和URL部分
  const [websiteProtocol, setWebsiteProtocol] = useState('https://');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  // 当网站字段变化时，更新协议和URL部分
  useEffect(() => {
    if (formData.website) {
      if (formData.website.startsWith('http://')) {
        setWebsiteProtocol('http://');
        setWebsiteUrl(formData.website.substring(7));
      } else if (formData.website.startsWith('https://')) {
        setWebsiteProtocol('https://');
        setWebsiteUrl(formData.website.substring(8));
      } else {
        setWebsiteProtocol('https://');
        setWebsiteUrl(formData.website);
      }
    } else {
      setWebsiteProtocol('https://');
      setWebsiteUrl('');
    }
  }, [formData.website]);
  
  // 当协议或URL部分变化时，更新完整的网站地址
  const updateWebsite = (protocol: string, url: string) => {
    const fullWebsite = url ? `${protocol}${url}` : '';
    setFormData(prev => ({ ...prev, website: fullWebsite }));
  };
  
  const handleProtocolChange = (protocol: string) => {
    setWebsiteProtocol(protocol);
    updateWebsite(protocol, websiteUrl);
  };
  
  const handleWebsiteUrlChange = (url: string) => {
    setWebsiteUrl(url);
    updateWebsite(websiteProtocol, url);
  };
  
  const { mutate: uploadAvatar, isPending: uploadPending } = useUploadAvatar();
  
  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.nickname || '',
        email: profile.email || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        birthday: profile.birthday || '',
        location: profile.location || '',
        website: profile.website || ''
      });
    }
  }, [profile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证图片文件
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return;
      }
      
      uploadAvatar(file, {
        onSuccess: (data) => {
          if (data.data?.avatar_url) {
            setFormData(prev => ({
              ...prev,
              avatar: data.data?.avatar_url || ''
            }));
            toast.success('头像上传成功');
          }
        }
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 使用验证器进行表单验证
    const validator = createValidator();
    
    validator
      .required('email', formData.email || '', '邮箱')
      .email('email', formData.email || '')
      .nickname('nickname', formData.nickname || '')
      .phone('phone', formData.phone || '')
      .maxLength('bio', formData.bio || '', 500, '个人简介');
    
    // 验证性别（可选）
    if (formData.gender) {
      const validGenders = ['male', 'female', 'other'];
      if (!validGenders.includes(formData.gender)) {
        validator.addRule('gender', formData.gender, [
          {
            test: () => false,
            message: '请选择有效的性别'
          }
        ]);
      }
    }
    
    // 验证生日（可选）
    if (formData.birthday) {
      const birthdayDate = new Date(formData.birthday);
      const today = new Date();
      
      // 检查日期格式是否有效
      if (isNaN(birthdayDate.getTime())) {
        validator.addRule('birthday', formData.birthday, [
          {
            test: () => false,
            message: '请输入有效的生日日期'
          }
        ]);
      } else if (birthdayDate > today) {
        // 检查生日是否在未来
        validator.addRule('birthday', formData.birthday, [
          {
            test: () => false,
            message: '生日不能是未来日期'
          }
        ]);
      } else {
        // 检查年龄是否合理（不超过120岁）
        const maxAge = 120;
        const maxBirthDate = new Date();
        maxBirthDate.setFullYear(today.getFullYear() - maxAge);
        
        if (birthdayDate < maxBirthDate) {
          validator.addRule('birthday', formData.birthday, [
            {
              test: () => false,
              message: '请输入有效的生日日期'
            }
          ]);
        }
      }
    }
    
    // 验证所在地（可选）
    if (formData.location) {
      validator.minLength('location', formData.location, 2, '所在地');
      validator.maxLength('location', formData.location, 100, '所在地');
    }
    
    // 验证网站（可选）
    if (formData.website) {
      validator.addRule('website', formData.website, [
        {
          test: (val) => val.startsWith('http://') || val.startsWith('https://'),
          message: '网站地址必须以http://或https://开头'
        }
      ]);
    }
    
    const validationErrors = validator.getErrors();
    setErrors(validationErrors);
    
    if (!validator.isValid()) {
      // 显示第一个错误
      const firstError = validator.getFirstError();
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }
    
    // 确保提交的数据包含所有字段，包括新添加的性别、生日、所在地和网站
    const submitData = {
      nickname: formData.nickname,
      email: formData.email,
      bio: formData.bio,
      avatar: formData.avatar,
      phone: formData.phone,
      gender: formData.gender,
      birthday: formData.birthday,
      location: formData.location,
      website: formData.website
    };
    
    onSubmit(submitData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>编辑个人资料</CardTitle>
        <CardDescription>更新您的个人信息</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatar || ''} alt="用户头像" />
                  <AvatarFallback className="text-2xl">
                    {formData.nickname?.charAt(0) || profile?.user_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploadPending}
                  />
                </label>
              </div>
              <span className="text-sm text-muted-foreground">点击相机图标更换头像</span>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nickname">昵称</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    value={formData.nickname || ''}
                    onChange={handleInputChange}
                    placeholder="请输入昵称"
                    className={errors.nickname ? 'border-red-500' : ''}
                  />
                  {errors.nickname && (
                    <Alert className="py-2 px-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {errors.nickname[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱 *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    placeholder="请输入邮箱地址"
                    required
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <Alert className="py-2 px-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {errors.email[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="请输入手机号码"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <Alert className="py-2 px-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {errors.phone[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="请输入个人简介"
                  rows={4}
                  className={errors.bio ? 'border-red-500' : ''}
                />
                {errors.bio && (
                  <Alert className="py-2 px-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {errors.bio[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">性别</Label>
                  <Select value={formData.gender || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthday">生日</Label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday || ''}
                    onChange={handleInputChange}
                    className={errors.birthday ? 'border-red-500' : ''}
                  />
                  {errors.birthday && (
                    <Alert className="py-2 px-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {errors.birthday[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">所在地</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    placeholder="请输入所在地"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <Alert className="py-2 px-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {errors.location[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">网站</Label>
                <div className="flex">
                  <Select value={websiteProtocol} onValueChange={handleProtocolChange}>
                    <SelectTrigger className="w-32 rounded-r-none border-r-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http://">http://</SelectItem>
                      <SelectItem value="https://">https://</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="website"
                    name="website"
                    value={websiteUrl}
                    onChange={(e) => handleWebsiteUrlChange(e.target.value)}
                    placeholder="example.com"
                    className={`rounded-l-none ${errors.website ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.website && (
                  <Alert className="py-2 px-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {errors.website[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploadPending}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存更改
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}