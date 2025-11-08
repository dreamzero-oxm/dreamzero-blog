import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '@/utils/request';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { BaseResponse } from '@/interface/base';

// 验证access token的API响应接口
interface ValidateTokenResponse {
  valid: boolean;
}

// 刷新token的API响应接口
interface RefreshTokenResponse {
  success: boolean;
  access_token: string;
}

// 验证access token是否有效
export const useValidateAccessToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await post<BaseResponse<ValidateTokenResponse>>(api.validateAccessToken);
      return response;
    },
  });
};

// 刷新access token
export const useRefreshToken = (showToast = true) => {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await post<BaseResponse<RefreshTokenResponse>>(api.refreshToken, {
        body: { refresh_token: refreshToken },
      });
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.success) {
        // 更新localStorage中的token
        localStorage.setItem('access_token', data.data.access_token);
        // 触发自定义事件，通知其他组件token已更新
        window.dispatchEvent(new Event('tokenUpdating'));
      }else{
        throw new Error('Token刷新失败');
      }
    },
    onError: () => {
      if(showToast){
        toast.error('Token刷新失败，请重新登录');
      }
      // 刷新失败，清除所有token
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  });
};

// 检查并刷新token的hook
export const useCheckAndRefreshToken = (routeType: 'main' | 'manage' = 'main') => {
  const validateToken = useValidateAccessToken();
  const refreshToken = useRefreshToken(routeType === 'manage');
  const router = useRouter();
  
  const checkAndRefresh = async () => {
    
    try {
      // 首先验证access token是否有效
      const result = await validateToken.mutateAsync();
      return result.code === 0 && result?.data?.valid;
    } catch {
      try {
        await refreshToken.mutateAsync();
        return true;
      } catch {
        // 清除无效token
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // 触发tokenChange事件，通知header组件更新登录状态
        window.dispatchEvent(new Event('tokenClearing'));
        
        // 刷新失败，根据路由类型执行不同逻辑
        if (routeType === 'manage') {
          // 管理路由：强制跳转到登录页面
          router.push('/login');
        }
        return false;
      }
    }
  };
  
  return { checkAndRefresh, isLoading: validateToken.isPending || refreshToken.isPending };
};

export const useUserLogout = () => {
  const queryClient = useQueryClient();
  const logout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    queryClient.clear();
    // 触发自定义事件，通知其他组件token已清除
    window.dispatchEvent(new Event('tokenClearing'));
  };
  return logout;
};