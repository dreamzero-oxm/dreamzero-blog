import type { BaseResponse } from "@/interface/base";

interface RequestParams {
  params?: Record<string, any>;  // URL 查询参数
  data?: any;                    // 请求体数据
  headers?: Record<string, any>; // 自定义请求头
}

export async function get<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  try {
    // 处理查询参数
    const queryParams = options.params 
      ? `?${new URLSearchParams(options.params).toString()}` 
      : '';
    
    // GET 请求只需要基本的请求头
    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${url}${queryParams}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`[Get]HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Get]Request failed:', error);
    throw error;
  }
}

export async function post<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  try {
    // 处理查询参数
    const queryParams = options.params 
      ? `?${new URLSearchParams(options.params).toString()}` 
      : '';
    
    const response = await fetch(`${url}${queryParams}`, {
      method: 'POST',
      headers: options.data instanceof FormData ? {
        'Accept': 'application/json',
        ...options.headers,
      } : {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      body: options.data instanceof FormData ? options.data : options.data? JSON.stringify(options.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`[Post]HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Post]Request failed:', error);
    throw error;
  }
}

export async function put<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  try {
    // 处理查询参数
    const queryParams = options.params 
      ? `?${new URLSearchParams(options.params).toString()}` 
      : '';
    
      const response = await fetch(`${url}${queryParams}`, {
        method: 'PUT',
        headers: options.data instanceof FormData ? {
          'Accept': 'application/json',
          ...options.headers,
        } : {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        body: options.data instanceof FormData ? options.data : options.data? JSON.stringify(options.data) : undefined,
      });

    if (!response.ok) {
      throw new Error(`[Put]HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Put]Request failed:', error);
    throw error;
  }
}

export async function del<T = BaseResponse>(url: string, options: RequestParams = {}): Promise<T> {
  try {
    // 处理查询参数
    const queryParams = options.params 
      ? `?${new URLSearchParams(options.params).toString()}` 
      : '';
    
      const response = await fetch(`${url}${queryParams}`, {
        method: 'DELETE',
        headers: options.data instanceof FormData ? {
          'Accept': 'application/json',
          ...options.headers,
        } : {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        body: options.data instanceof FormData ? options.data : options.data? JSON.stringify(options.data) : undefined,
      });

    if (!response.ok) {
      throw new Error(`[Delete]HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Delete]Request failed:', error);
    throw error;
  }
}