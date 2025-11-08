'use client'

import { useEffect, useState } from 'react';
import { useCheckAndRefreshToken } from '@/hooks/auth-hook';
import router from 'next/router';

interface AuthProviderProps {
  children: React.ReactNode;
  routeType?: 'main' | 'manage';
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, routeType = 'main' }) => {
  const { checkAndRefresh, isLoading } = useCheckAndRefreshToken(routeType);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    
    // 使用统一的认证方法验证登录状态
    checkAndRefresh().then((result) => {
      // 如果认证成功，设置isLogin为true，如果失败，则跳转到登录页面
      if (result) {
        setIsLogin(true);
      } else {
        router.push('/login');
      }
    });
  }, []);

  // 如果正在验证token，可以显示加载状态
  if (!isLogin || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">验证身份中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;