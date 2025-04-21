interface RequestParams {
  params?: Record<string, any>;  // URL 查询参数
  data?: any;                    // 请求体数据
  headers?: Record<string, any>; // 自定义请求头
}

export async function get(url: string, options: RequestParams = {}) {
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

    console.log(`${url}${queryParams}`)
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