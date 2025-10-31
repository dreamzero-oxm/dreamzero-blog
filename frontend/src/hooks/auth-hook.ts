import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '@/utils/request';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';

// 验证access token的API响应接口
interface ValidateTokenResponse {
  valid: boolean;
}

// 刷新token的API响应接口
interface RefreshTokenResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
}

// 验证access token是否有效
export const useValidateAccessToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await post<ValidateTokenResponse>(api.validateAccessToken);
      return response;
    },
  });
};

// 刷新access token
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await post<RefreshTokenResponse>(api.refreshToken, {
        body: { refresh_token: refreshToken },
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        // 更新localStorage中的token
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        // 触发自定义事件，通知其他组件token已更新
        window.dispatchEvent(new Event('tokenChange'));
      }
    },
    onError: () => {
      toast.error('Token刷新失败，请重新登录');
      // 刷新失败，清除所有token
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  });
};

// 检查并刷新token的hook
export const useCheckAndRefreshToken = () => {
  const validateToken = useValidateAccessToken();
  const refreshToken = useRefreshToken();
  const router = useRouter();
  
  const checkAndRefresh = async () => {
    // 开发模式下跳过登录验证
    if (process.env.NODE_ENV === 'development') {
      console.log('开发模式：跳过登录验证');
      return true;
    }
    
    try {
      // 首先验证access token是否有效
      const result = await validateToken.mutateAsync();
      
      if (result.valid) {
        // access token有效，无需刷新
        return true;
      } else {
        // access token无效，尝试刷新
        try {
          await refreshToken.mutateAsync();
          return true;
        } catch {
          // 刷新失败，跳转到登录页
          router.push('/login');
          return false;
        }
      }
    } catch {
      // 验证失败，跳转到登录页
      router.push('/login');
      return false;
    }
  };
  
  return { checkAndRefresh, isLoading: validateToken.isPending || refreshToken.isPending };
};

export const useUserLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const logout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    queryClient.clear();
    // 触发自定义事件，通知其他组件token已清除
    window.dispatchEvent(new Event('tokenChange'));
    
    // 开发模式下不跳转到登录页
    if (process.env.NODE_ENV !== 'development') {
      router.push('/login');
    } else {
      console.log('开发模式：已登出，但不跳转到登录页');
    }
  };
  return logout;
};