import type { BaseResponse } from "@/interface/base";
import api from "@/lib/api";

interface RequestParams {
  params?: Record<string, any>;  // URL 查询参数
  body?: any;                    // 请求体数据
  headers?: Record<string, any>; // 自定义请求头
}

// 刷新token的函数
const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }
    
    const response = await fetch(api.refreshToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      // 触发自定义事件，通知其他组件token已更新
      window.dispatchEvent(new Event('tokenChange'));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// 通用的请求处理函数
const makeRequest = async <T = BaseResponse>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options: RequestParams = {}
): Promise<T> => {
  // 处理查询参数
  const queryParams = options.params 
    ? `?${new URLSearchParams(options.params).toString()}` 
    : '';
  
  // 获取token
  const getToken = () => localStorage.getItem('access_token');
  
  // 发送请求的函数
  const sendRequest = async (token: string | null): Promise<Response> => {
    const headers = options.body instanceof FormData ? {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    } : {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    
    return fetch(`${url}${queryParams}`, {
      method,
      headers,
      body: options.body instanceof FormData ? options.body : options.body? JSON.stringify(options.body) : undefined,
    });
  };
  
  try {
    let token = getToken();
    let response = await sendRequest(token);
    
    // 如果是401错误，尝试刷新token并重试
    if (response.status === 401 && token) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        // 使用新token重试请求
        token = getToken();
        response = await sendRequest(token);
      } else {
        // 刷新失败，清除token并抛出错误
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('tokenChange'));
        throw new Error(`[${method}]Token refresh failed`);
      }
    }
    
    if (!response.ok) {
      throw new Error(`[${method}]HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[${method}]Request failed:`, error);
    throw error;
  }
};

export async function get<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  return makeRequest<T>('GET', url, options);
}

export async function post<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  return makeRequest<T>('POST', url, options);
}

export async function put<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  return makeRequest<T>('PUT', url, options);
}

export async function del<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  return makeRequest<T>('DELETE', url, options);
}