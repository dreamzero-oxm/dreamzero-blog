'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { createValidator } from '@/lib/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PasswordChangeFormProps {
  onSubmit: (data: { old_password: string, new_password: string }) => void;
  isLoading?: boolean;
}

export default function PasswordChangeForm({ onSubmit, isLoading = false }: PasswordChangeFormProps) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 使用验证器进行表单验证
    const validator = createValidator();
    
    validator
      .required('old_password', formData.old_password, '当前密码')
      .required('new_password', formData.new_password, '新密码')
      .password('new_password', formData.new_password)
      .required('confirm_password', formData.confirm_password, '确认密码')
      .equals(
        'confirm_password', 
        formData.confirm_password, 
        formData.new_password, 
        '确认密码', 
        '新密码'
      );
    
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
    
    onSubmit({
      old_password: formData.old_password,
      new_password: formData.new_password
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          修改密码
        </CardTitle>
        <CardDescription>更改您的账户密码以提高安全性</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">当前密码 *</Label>
              <div className="relative">
                <Input
                  id="old_password"
                  name="old_password"
                  type={showPasswords.old_password ? 'text' : 'password'}
                  value={formData.old_password}
                  onChange={handleInputChange}
                  placeholder="请输入当前密码"
                  required
                  className={errors.old_password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => togglePasswordVisibility('old_password')}
                >
                  {showPasswords.old_password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.old_password && (
                <Alert className="py-2 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {errors.old_password[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new_password">新密码 *</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  name="new_password"
                  type={showPasswords.new_password ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={handleInputChange}
                  placeholder="请输入新密码（至少8位，包含大小写字母、数字和特殊字符）"
                  required
                  className={errors.new_password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => togglePasswordVisibility('new_password')}
                >
                  {showPasswords.new_password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.new_password && (
                <Alert className="py-2 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {errors.new_password[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm_password">确认新密码 *</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPasswords.confirm_password ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="请再次输入新密码"
                  required
                  className={errors.confirm_password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => togglePasswordVisibility('confirm_password')}
                >
                  {showPasswords.confirm_password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <Alert className="py-2 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {errors.confirm_password[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md">
            <h4 className="font-medium mb-2">密码要求：</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 至少8个字符</li>
              <li>• 建议包含大小写字母、数字和特殊字符</li>
              <li>• 避免使用常见密码或个人信息</li>
            </ul>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  更新中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  更新密码
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}