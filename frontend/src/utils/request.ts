import type { BaseResponse } from "@/interface/base";
import { handleError, isResponseSuccess, getResponseError } from './error-handler';
import api from '@/lib/api';

interface RequestParams {
  params?: Record<string, any>;  // URL 查询参数
  body?: any;                    // 请求体数据
  headers?: Record<string, any>; // 自定义请求头
  retries?: number;              // 重试次数，默认为0
  retryDelay?: number;           // 重试延迟(ms)，默认为1000
  timeout?: number;              // 请求超时时间(ms)，默认为10000
  signal?: AbortSignal;          // 取消请求的信号
}

interface RequestOptions extends RequestParams {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
}

const isRemoteAPI = false

// 基础API URL，指向后端服务器
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://dreamzero.cn' 
  : isRemoteAPI ? 'https://dreamzero.cn' : 'http://localhost:9997';

// 带超时的fetch
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// 通用的请求处理函数
const makeRequest = async <T = BaseResponse>(
  options: RequestOptions
): Promise<T> => {
  const {
    method,
    url,
    params = {},
    body,
    headers = {},
    timeout = 10000,
    signal
  } = options;
  
  // 处理查询参数
  const queryParams = Object.keys(params).length 
    ? `?${new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (Array.isArray(value)) {
            // 对于数组参数，为每个元素添加相同的键
            value.forEach(item => acc.append(key, item));
          } else {
            acc.append(key, value);
          }
          return acc;
        }, new URLSearchParams())
      ).toString()}` 
    : '';
  
  // 获取token
  const getToken = () => localStorage.getItem('access_token');
  
  // 刷新token的函数（非Hook版本）
  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }
    
    // 直接使用fetch避免循环依赖
    const fullUrl = API_BASE_URL ? `${API_BASE_URL}${api.refreshToken}` : api.refreshToken;
    const response = await fetchWithTimeout(
      fullUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      },
      timeout
    );
    
    if (!response.ok) {
      throw new Error(`Token refresh failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.data?.success) {
      localStorage.setItem('access_token', data.data.access_token);
      window.dispatchEvent(new Event('tokenUpdating'));
      return data;
    } else {
      throw new Error('Token刷新失败');
    }
  };
  
  // 发送请求的函数
  const sendRequest = async (token: string | null, attempt: number = 0): Promise<T> => {
    try {
      const requestHeaders = body instanceof FormData ? {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...headers,
      } : {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...headers,
      };
      
      // 构建完整的URL，如果url已经是完整URL则直接使用，否则添加基础URL
      const fullUrl = API_BASE_URL ? `${API_BASE_URL}${url}` : url;
      
      const response = await fetchWithTimeout(
        `${fullUrl}${queryParams}`,
        {
          method,
          headers: requestHeaders,
          body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
          signal
        },
        timeout
      );
      
      // 如果是401错误，尝试刷新token并重试
      if (response.status === 401 && token) {
        console.log('401 error, trying to refresh token');
        try {
          await refreshToken();
          const newToken = getToken();
          return sendRequest(newToken, attempt);
        } catch (error) {
          // 刷新失败，清除token并抛出错误
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.dispatchEvent(new Event('tokenClearing'));
          throw handleError(error);
        }
      }
      
      if (!response.ok) {
        throw handleError(new Error(`[${method}]HTTP error! status: ${response.status}`));
      }
      
      const data = await response.json();
      
      // 检查API响应是否成功
      if (!isResponseSuccess(data)) {
        throw handleError(new Error(getResponseError(data)));
      }
      
      return data;
    } catch (error) {
      const apiError = handleError(error);
      throw apiError;
    }
  };
  
  try {
    const token = getToken();
    return await sendRequest(token);
  } catch (error) {
    console.error(`[${method}]Request failed:`, error);
    throw error;
  }
};

// 导出请求函数
export async function get<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  return makeRequest<T>({ method: 'GET', url, ...options });
}

export async function post<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  return makeRequest<T>({ method: 'POST', url, ...options });
}

export async function put<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  return makeRequest<T>({ method: 'PUT', url, ...options });
}

export async function del<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  return makeRequest<T>({ method: 'DELETE', url, ...options });
}

// 创建可取消的请求
export const createCancellableRequest = <T = BaseResponse>(
  requestFn: (signal: AbortSignal) => Promise<T>
) => {
  const controller = new AbortController();
  
  const promise = requestFn(controller.signal);
  
  return {
    promise,
    cancel: () => controller.abort()
  };
};