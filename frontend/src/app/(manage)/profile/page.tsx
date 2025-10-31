'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useGetUserProfile, useUpdateUserProfile, useUploadAvatar, useChangePassword, useGetOperationLogs } from '@/hooks/user-hook';
import { UserProfile, OperationLog } from '@/interface/user';
import { Loader2, Edit, Camera, Lock, History } from 'lucide-react';
import { toast } from 'sonner';
import ProfileEditForm from '@/components/profile/profile-edit-form';
import PasswordChangeForm from '@/components/profile/password-change-form';
import OperationLogsTable from '@/components/profile/operation-logs-table';
import AvatarUpload from '@/components/profile/avatar-upload';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  
  useEffect(() => {
    if (profile?.avatar) {
      setCurrentAvatar(profile.avatar);
    }
  }, [profile]);
  
  const { data: profileData, isPending: profileLoading, refetch: refetchProfile } = useGetUserProfile();
  const { mutate: updateProfile, isPending: updatePending } = useUpdateUserProfile();
  const { mutate: uploadAvatar, isPending: uploadPending } = useUploadAvatar();
  const { mutate: changePassword, isPending: changePasswordPending } = useChangePassword();
  const { data: logsData, isPending: logsLoading } = useGetOperationLogs();
  
  const profile = profileData?.data;
  const logs = logsData?.data?.logs || [];
  
  const handleAvatarChange = (avatarUrl: string) => {
    setCurrentAvatar(avatarUrl);
    refetchProfile();
  };
  
  const handleProfileUpdate = (updatedProfile: Partial<UserProfile>) => {
    updateProfile(updatedProfile, {
      onSuccess: () => {
        setIsEditing(false);
        refetchProfile();
      }
    });
  };
  
  const handlePasswordChange = (passwordData: { old_password: string, new_password: string }) => {
    changePassword(passwordData);
  };
  
  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">个人信息管理</h1>
        <p className="text-muted-foreground mt-2">查看和编辑您的个人资料信息</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <span>概览</span>
          </TabsTrigger>
          <TabsTrigger value="avatar" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span>头像</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span>编辑</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>安全</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>操作日志</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>您的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentAvatar || ''} alt={profile?.nickname || '用户头像'} />
                    <AvatarFallback className="text-2xl">
                      {profile?.nickname?.charAt(0) || profile?.user_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('avatar')}
                    className="mt-2"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    更换头像
                  </Button>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">用户名</p>
                    <p className="text-base">{profile?.user_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">昵称</p>
                    <p className="text-base">{profile?.nickname || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">邮箱</p>
                    <p className="text-base">{profile?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">手机号</p>
                    <p className="text-base">{profile?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">角色</p>
                    <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                      {profile?.role === 'admin' ? '管理员' : '普通用户'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">状态</p>
                    <Badge variant={profile?.status === 'active' ? 'default' : 'destructive'}>
                      {profile?.status === 'active' ? '正常' : '已锁定'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab('edit')}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑资料
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="avatar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AvatarUpload 
              currentAvatar={currentAvatar}
              username={profile?.user_name}
              onAvatarChange={handleAvatarChange}
            />
            <Card>
              <CardHeader>
                <CardTitle>当前头像</CardTitle>
                <CardDescription>您当前使用的头像</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={currentAvatar || ''} alt={profile?.nickname || '用户头像'} />
                  <AvatarFallback className="text-3xl">
                    {profile?.nickname?.charAt(0) || profile?.user_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground text-center">
                  您的头像将显示在个人资料、评论和其他用户可见的地方
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="edit">
          <ProfileEditForm 
            profile={profile} 
            onSubmit={handleProfileUpdate}
            isLoading={updatePending}
          />
        </TabsContent>
        
        <TabsContent value="security">
          <PasswordChangeForm 
            onSubmit={handlePasswordChange}
            isLoading={changePasswordPending}
          />
        </TabsContent>
        
        <TabsContent value="logs">
          <OperationLogsTable 
            logs={logs}
            isLoading={logsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}