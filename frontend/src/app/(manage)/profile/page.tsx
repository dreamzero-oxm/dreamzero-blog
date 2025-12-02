/**
 * @fileoverview 个人信息管理页面组件
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/(manage)/profile/page.tsx
 * @description 提供用户个人信息查看、编辑、头像更换、密码修改和操作日志查看功能
 * @author dreamzero
 * @lastModified 2023-12-01
 * 
 * 主要功能模块：
 * 1. 个人信息概览 - 展示用户基本信息
 * 2. 头像管理 - 上传和更换用户头像
 * 3. 个人资料编辑 - 修改用户基本信息
 * 4. 安全设置 - 修改用户密码
 * 5. 操作日志 - 查看用户操作记录
 * 
 * 业务逻辑：
 * - 使用React Hooks进行状态管理和副作用处理
 * - 通过自定义hooks获取和更新用户数据
 * - 使用标签页组件组织不同功能模块
 * - 响应式设计适配不同屏幕尺寸
 */

'use client' // 声明为客户端组件，允许使用React hooks和事件处理

// React核心hooks导入
import { useState, useEffect } from 'react'; // useState用于组件状态管理，useEffect用于处理副作用

// UI组件导入 - shadcn/ui组件库
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // 卡片组件，用于内容分组
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // 头像组件，用于显示用户头像
import { Button } from '@/components/ui/button'; // 按钮组件，用于用户交互
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // 标签页组件，用于功能模块切换
import { Separator } from '@/components/ui/separator'; // 分隔线组件，用于视觉分隔

// 自定义hooks导入 - 用户相关数据获取和操作
import { useGetUserProfile, useUpdateUserProfile, useChangePassword, useGetOperationLogs } from '@/hooks/user-hook';
// useGetUserProfile: 获取用户个人信息
// useUpdateUserProfile: 更新用户个人信息
// useChangePassword: 修改用户密码
// useGetOperationLogs: 获取用户操作日志

// 类型定义导入
import { UserProfile } from '@/interface/user'; // 用户信息类型定义

// 图标组件导入 - lucide-react图标库
import { Loader2, Edit, Camera, Lock, History } from 'lucide-react';
// Loader2: 加载动画图标
// Edit: 编辑图标
// Camera: 相机图标，用于头像上传
// Lock: 锁图标，用于安全设置
// History: 历史记录图标，用于操作日志

// 子组件导入 - 个人信息管理相关组件
import ProfileEditForm from '@/components/profile/profile-edit-form'; // 个人信息编辑表单组件
import PasswordChangeForm from '@/components/profile/password-change-form'; // 密码修改表单组件
import OperationLogsTable from '@/components/profile/operation-logs-table'; // 操作日志表格组件
import { AvatarUpload } from '@/components/profile/avatar-upload'; // 头像上传组件

/**
 * 个人信息管理页面组件
 * 
 * @component
 * @description 提供用户个人信息管理的完整界面，包括信息查看、编辑、头像更换、密码修改和操作日志查看
 * 
 * 状态管理机制：
 * - activeTab: 当前激活的标签页，控制显示的功能模块
 * - currentAvatar: 当前用户头像URL，用于头像显示和更新
 * 
 * 数据获取机制：
 * - 使用自定义hooks获取用户信息、操作日志等数据
 * - 使用React Query的mutate函数进行数据更新
 * 
 * @returns {JSX.Element} 个人信息管理页面的JSX元素
 */
export default function ProfilePage() {
  // 状态定义：当前激活的标签页，默认为'overview'（概览）
  const [activeTab, setActiveTab] = useState('overview');

  // 状态定义：当前用户头像URL，初始为空字符串
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  
  // 使用自定义hook获取用户个人信息
  // profileData: 包含用户信息的响应数据
  // profileLoading: 加载状态，用于显示加载动画
  // refetchProfile: 重新获取用户信息的函数
  const { data: profileData, isPending: profileLoading, refetch: refetchProfile } = useGetUserProfile();
  
  // 使用自定义hook更新用户个人信息
  // updateProfile: 更新用户信息的函数
  // updatePending: 更新操作的加载状态
  const { mutate: updateProfile, isPending: updatePending } = useUpdateUserProfile();

  // 使用自定义hook修改用户密码
  // changePassword: 修改密码的函数
  // changePasswordPending: 密码修改操作的加载状态
  const { mutate: changePassword, isPending: changePasswordPending } = useChangePassword();
  
  // 使用自定义hook获取用户操作日志
  // logsData: 包含操作日志的响应数据
  // logsLoading: 日志加载状态
  const { data: logsData, isPending: logsLoading } = useGetOperationLogs();
  
  // 从响应数据中提取用户信息
  const profile = profileData?.user;
  // 从响应数据中提取操作日志列表，如果没有数据则使用空数组
  const logs = logsData?.data?.logs || [];
  
/**
 * 副作用处理：当用户信息加载完成后，更新当前头像状态
 * 
 * @effect
 * @description 监听profile数据变化，当用户信息加载完成且包含头像URL时，更新currentAvatar状态
 * 
 * 依赖项：
 * - profile: 用户信息数据，当其变化时触发副作用
 * 
 * 实现思路：
 * 1. 检查profile对象是否存在且包含avatar属性
 * 2. 如果存在，则将avatar URL设置到currentAvatar状态中
 * 3. 确保头像显示与用户数据同步
 */
  useEffect(() => {
    // 检查用户信息是否存在且包含头像URL
    if (profile?.avatar) {
      // 更新当前头像状态，确保界面显示最新头像
      setCurrentAvatar(profile.avatar);
    }
  }, [profile]); // 依赖项：当profile数据变化时重新执行此副作用
  
/**
 * 处理头像更改事件
 * 
 * @function
 * @param {string} avatarUrl - 新的头像URL
 * @description 当用户上传新头像后，更新当前头像状态并重新获取用户信息
 * 
 * 实现思路：
 * 1. 更新本地头像状态，立即显示新头像
 * 2. 重新获取用户信息，确保数据一致性
 * 3. 避免页面刷新，提供流畅的用户体验
 */
  const handleAvatarChange = (avatarUrl: string) => {
    // 立即更新本地头像状态，提供即时反馈
    setCurrentAvatar(avatarUrl);
    // 重新获取用户信息，确保服务器端数据与本地显示一致
    refetchProfile();
  };
  
  /**
 * 处理个人信息更新事件
 * 
 * @function
 * @param {Partial<UserProfile>} updatedProfile - 包含更新字段的部分用户信息对象
 * @description 调用API更新用户个人信息，成功后重新获取最新用户数据
 * 
 * 实现思路：
 * 1. 使用updateProfile函数发送更新请求
 * 2. 设置成功回调，在更新成功后重新获取用户信息
 * 3. 确保界面显示最新的用户数据
 * 
 * @typedef {Object} UserProfile - 用户信息类型
 * @property {string} [user_name] - 用户名
 * @property {string} [nickname] - 昵称
 * @property {string} [email] - 邮箱
 * @property {string} [avatar] - 头像URL
 */
  const handleProfileUpdate = (updatedProfile: Partial<UserProfile>) => {
    // 调用更新API，传入部分用户信息
    updateProfile(updatedProfile, {
      // 成功回调：更新成功后重新获取用户信息
      onSuccess: () => {
        refetchProfile();
      }
    });
  };
  
  /**
 * 处理密码更改事件
 * 
 * @function
 * @param {{old_password: string, new_password: string}} passwordData - 包含旧密码和新密码的对象
 * @description 调用API修改用户密码
 * 
 * 实现思路：
 * 1. 直接调用changePassword函数发送密码修改请求
 * 2. 密码修改是敏感操作，由后端API处理所有验证逻辑
 * 3. 成功/失败反馈由PasswordChangeForm组件处理
 * 
 * @typedef {Object} PasswordData - 密码修改数据类型
 * @property {string} old_password - 旧密码
 * @property {string} new_password - 新密码
 */
  const handlePasswordChange = (passwordData: { old_password: string, new_password: string }) => {
    // 调用密码修改API，传入旧密码和新密码
    changePassword(passwordData);
  };
  
/**
 * 加载状态渲染
 * 
 * @description 当用户信息正在加载时，显示加载动画
 * 
 * 性能优化点：
 * - 使用条件渲染避免不必要的组件渲染
 * - 提供视觉反馈，改善用户体验
 * 
 * @returns {JSX.Element} 加载动画的JSX元素
 */
  if (profileLoading) {
    return (
      // 居中显示加载动画，高度为96（24rem）
      <div className="flex justify-center items-center h-96">
        {/* 使用Loader2图标并添加旋转动画，颜色为主题色 */}
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
/**
 * 主渲染函数
 * 
 * @returns {JSX.Element} 个人信息管理页面的完整JSX结构
 * 
 * 布局结构：
 * 1. 页面标题和描述
 * 2. 标签页导航（概览、头像、编辑、安全、操作日志）
 * 3. 标签页内容区域
 * 
 * 响应式设计：
 * - 使用Tailwind CSS的响应式类适配不同屏幕尺寸
 * - 容器使用mx-auto居中，内边距根据屏幕尺寸调整
 */
  return (
    // 主容器：响应式布局，居中对齐，添加适当的内边距
    <div className="w-full py-4 sm:py-6 px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
      {/* 页面标题区域 */}
      <div className="mb-4 sm:mb-6">
        {/* 页面主标题 */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">个人信息管理</h1>
        {/* 页面描述文本 */}
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">查看和编辑您的个人资料信息</p>
      </div>

      {/* 标签页组件：控制不同功能模块的显示 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        {/* 标签页导航栏：移动端横向滚动，桌面端网格布局 */}
        <TabsList className="grid w-full grid-cols-5 sm:grid-cols-5 max-w-full">
          {/* 移动端优化：使用省略号显示长文本 */}
          {/* 桌面端：显示完整标签 */}
          {/* 概览标签页 */}
          <TabsTrigger value="overview" className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <span className="hidden sm:inline">概览</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
          {/* 头像管理标签页 */}
          <TabsTrigger value="avatar" className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">头像</span>
            <span className="sm:hidden">头像</span>
          </TabsTrigger>
          {/* 个人信息编辑标签页 */}
          <TabsTrigger value="edit" className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">编辑</span>
            <span className="sm:hidden">编辑</span>
          </TabsTrigger>
          {/* 安全设置标签页 */}
          <TabsTrigger value="security" className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">安全</span>
            <span className="sm:hidden">安全</span>
          </TabsTrigger>
          {/* 操作日志标签页 */}
          <TabsTrigger value="logs" className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
            <History className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">操作日志</span>
            <span className="sm:hidden">日志</span>
          </TabsTrigger>
        </TabsList>
        
        {/* 概览标签页内容：显示用户基本信息 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 用户头像和基本信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>您的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* 用户头像和基本信息布局 */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* 用户头像区域 */}
                <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src={currentAvatar || ''} alt={profile?.nickname || '用户头像'} />
                    <AvatarFallback className="text-xl sm:text-2xl">
                      {profile?.nickname?.charAt(0) || profile?.user_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('avatar')}
                    className="mt-2 text-xs sm:text-sm"
                  >
                    <Camera className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">更换头像</span>
                    <span className="sm:hidden">更换</span>
                  </Button>
                </div>

                {/* 用户基本信息网格 */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">用户名</p>
                    <p className="text-base">{profile?.user_name || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">昵称</p>
                    <p className="text-base">{profile?.nickname || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">性别</p>
                    <p className="text-base">
                      {profile?.gender === 'male' ? '男' : 
                       profile?.gender === 'female' ? '女' : 
                       profile?.gender === 'other' ? '其他' : '未设置'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">生日</p>
                    <p className="text-base">{profile?.birthday ? new Date(profile.birthday).toLocaleDateString('zh-CN') : '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">所在地</p>
                    <p className="text-base">{profile?.location || '未设置'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">手机号</p>
                    <p className="text-base">{profile?.phone || '未设置'}</p>
                  </div>
                </div>
              </div>
              
              {/* 个人简介 */}
              <div className="col-span-full">
                <p className="text-sm font-medium text-muted-foreground mb-2">个人简介</p>
                <p className="text-sm sm:text-base bg-muted/50 p-3 rounded-md min-h-[60px] sm:min-h-[80px]">
                  {profile?.bio || '未设置个人简介'}
                </p>
              </div>

              <Separator className="col-span-full" />

              {/* 操作按钮区域 */}
              <div className="flex justify-end col-span-full">
                <Button
                  onClick={() => setActiveTab('edit')}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  <Edit className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">编辑资料</span>
                  <span className="sm:hidden">编辑</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* 联系信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>联系信息</CardTitle>
              <CardDescription>您的联系方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">邮箱</p>
                  <p className="text-sm sm:text-base break-words">{profile?.email || '未设置'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">个人网站</p>
                  {profile?.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base text-primary hover:underline break-words"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    <p className="text-sm sm:text-base">未设置</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 账户状态卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>账户状态</CardTitle>
              <CardDescription>您的账户信息和状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">账户状态</p>
                  <div className="flex items-center gap-2 mt-1">
                    {profile?.is_locked ? (
                      <>
                        <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                        <span className="text-sm sm:text-base text-destructive">已锁定</span>
                        {profile?.lock_until && (
                          <span className="text-xs sm:text-sm text-muted-foreground break-words">
                            (至 {new Date(profile.lock_until).toLocaleString('zh-CN')})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm sm:text-base">正常</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">注册时间</p>
                  <p className="text-sm sm:text-base">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleString('zh-CN') : '未知'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">最后更新</p>
                  <p className="text-sm sm:text-base">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleString('zh-CN') : '未知'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 头像管理标签页内容：提供头像上传和预览功能 */}
        <TabsContent value="avatar">
          {/* 两列布局：左侧上传区域，右侧预览区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* 头像上传组件 */}
            <div className="w-full">
              <AvatarUpload
                currentAvatar={currentAvatar} // 当前头像URL
                username={profile?.user_name} // 用户名，用于头像文件命名
                onAvatarChange={handleAvatarChange} // 头像更改回调函数
              />
            </div>
            {/* 当前头像预览卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>当前头像</CardTitle>
                <CardDescription>您当前使用的头像</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {/* 大尺寸头像预览 */}
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  <AvatarImage src={currentAvatar || ''} alt={profile?.nickname || '用户头像'} />
                  <AvatarFallback className="text-2xl sm:text-3xl">
                    {profile?.nickname?.charAt(0) || profile?.user_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* 头像使用说明 */}
                <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                  您的头像将显示在个人资料、评论和其他用户可见的地方
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* 个人信息编辑标签页内容：提供个人信息编辑表单 */}
        <TabsContent value="edit">
          <ProfileEditForm 
            profile={profile} // 当前用户信息
            onSubmit={handleProfileUpdate} // 提交更新回调函数
            isLoading={updatePending} // 更新操作加载状态
          />
        </TabsContent>
        
        {/* 安全设置标签页内容：提供密码修改表单 */}
        <TabsContent value="security">
          <PasswordChangeForm 
            onSubmit={handlePasswordChange} // 密码修改回调函数
            isLoading={changePasswordPending} // 密码修改操作加载状态
          />
        </TabsContent>
        
        {/* 操作日志标签页内容：显示用户操作历史记录 */}
        <TabsContent value="logs">
          <OperationLogsTable 
            logs={logs} // 操作日志数据
            isLoading={logsLoading} // 日志加载状态
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}