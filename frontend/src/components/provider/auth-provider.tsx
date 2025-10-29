'use client'

import { useEffect } from 'react';
import { useCheckAndRefreshToken } from '@/hooks/auth-hook';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { checkAndRefresh, isLoading } = useCheckAndRefreshToken();

  useEffect(() => {
    // 检查是否有access token
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
      // 如果有access token，验证它是否有效
      checkAndRefresh();
    }
  }, [checkAndRefresh]);

  // 如果正在验证token，可以显示加载状态
  if (isLoading) {
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