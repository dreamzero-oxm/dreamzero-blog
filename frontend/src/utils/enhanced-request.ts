import type { BaseResponse } from '@/interface/base';
import { handleError, ErrorType, isResponseSuccess, getResponseError } from './error-handler';
import api from '@/lib/api';

interface RequestParams {
  params?: Record<string, any>;  // URL 查询参数
  body?: any;                    // 请求体数据
  headers?: Record<string, any>; // 自定义请求头
  retries?: number;              // 重试次数，默认为0
  retryDelay?: number;           // 重试延迟(ms)，默认为1000
  timeout?: number;              // 请求超时时间(ms)，默认为30000
  signal?: AbortSignal;          // 取消请求的信号
}

interface RequestOptions extends RequestParams {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
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

// 延迟函数
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

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
    retries = 0,
    retryDelay = 1000,
    timeout = 30000,
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
      
      const response = await fetchWithTimeout(
        `${url}${queryParams}`,
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
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // 使用新token重试请求
          const newToken = getToken();
          return sendRequest(newToken, attempt);
        } else {
          // 刷新失败，清除token并抛出错误
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.dispatchEvent(new Event('tokenChange'));
          throw handleError(new Error(`[${method}]Token refresh failed`));
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
      
      // 如果是网络错误或服务器错误，且还有重试次数，则重试
      if (
        (apiError.type === ErrorType.NETWORK_ERROR || apiError.type === ErrorType.SERVER_ERROR) &&
        attempt < retries
      ) {
        console.warn(`Request failed, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${retries}):`, apiError.message);
        await delay(retryDelay);
        return sendRequest(token, attempt + 1);
      }
      
      throw apiError;
    }
  };
  
  try {
    let token = getToken();
    return await sendRequest(token);
  } catch (error) {
    console.error(`[${method}]Request failed:`, error);
    throw error;
  }
};

// 导出增强的请求函数
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