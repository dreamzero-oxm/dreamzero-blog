import type { BaseResponse } from '@/interface/base';

// 错误类型枚举
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 自定义错误类
export class ApiError extends Error {
  public type: ErrorType;
  public code: number;
  public details?: any;

  constructor(message: string, type: ErrorType, code: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.code = code;
    this.details = details;
  }
}

// 错误处理函数
export const handleError = (error: any): ApiError => {
  // 如果已经是ApiError，直接返回
  if (error instanceof ApiError) {
    return error;
  }

  // AbortError: 请求被取消（通常是 React Query 自动取消或用户主动取消）
  // 这种情况不应该显示错误提示，因为这是正常的请求取消行为
  if (error.name === 'AbortError' || error.message === 'signal is aborted without reason') {
    return new ApiError(
      '请求已取消',
      ErrorType.UNKNOWN_ERROR,
      0,
      { silent: true }  // 标记为静默错误，不应该显示 toast
    );
  }

  // 网络错误
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new ApiError(
      '网络连接失败，请检查您的网络设置',
      ErrorType.NETWORK_ERROR,
      0
    );
  }

  // API错误
  if (error.message && error.message.includes('[')) {
    const match = error.message.match(/\[(GET|POST|PUT|DELETE)\](.+)/);
    if (match) {
      const message = match[2].trim();
      
      if (message.includes('Token refresh failed')) {
        return new ApiError(
          '登录已过期，请重新登录',
          ErrorType.AUTHENTICATION_ERROR,
          401
        );
      }
      
      if (message.includes('HTTP error! status:')) {
        const status = parseInt(message.split('status: ')[1]);
        
        if (status === 401) {
          return new ApiError(
            '未授权访问，请先登录',
            ErrorType.AUTHENTICATION_ERROR,
            401
          );
        }
        
        if (status === 403) {
          return new ApiError(
            '权限不足，无法访问此资源',
            ErrorType.AUTHORIZATION_ERROR,
            403
          );
        }
        
        if (status === 404) {
          return new ApiError(
            '请求的资源不存在',
            ErrorType.NOT_FOUND_ERROR,
            404
          );
        }
        
        if (status >= 500) {
          return new ApiError(
            '服务器内部错误，请稍后再试',
            ErrorType.SERVER_ERROR,
            status
          );
        }
        
        if (status >= 400) {
          return new ApiError(
            '请求参数错误，请检查输入',
            ErrorType.VALIDATION_ERROR,
            status
          );
        }
      }
    }
  }

  // 默认未知错误
  return new ApiError(
    error.message || '发生未知错误，请稍后再试',
    ErrorType.UNKNOWN_ERROR,
    0,
    error
  );
};

// 根据错误类型获取用户友好的错误消息
export const getErrorMessage = (error: ApiError): string => {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return '网络连接失败，请检查您的网络设置';
    case ErrorType.AUTHENTICATION_ERROR:
      return '登录已过期，请重新登录';
    case ErrorType.AUTHORIZATION_ERROR:
      return '权限不足，无法访问此资源';
    case ErrorType.NOT_FOUND_ERROR:
      return '请求的资源不存在';
    case ErrorType.VALIDATION_ERROR:
      return '请求参数错误，请检查输入';
    case ErrorType.SERVER_ERROR:
      return '服务器内部错误，请稍后再试';
    default:
      return error.message || '发生未知错误，请稍后再试';
  }
};

// 检查响应是否成功
export const isResponseSuccess = (response: BaseResponse): boolean => {
  return response.code === 200 || response.code === 0;
};

// 从响应中提取错误信息
export const getResponseError = (response: BaseResponse): string => {
  return response.msg || '操作失败';
};

/**
 * 处理错误并显示 toast 提示（静默错误不会显示 toast）
 * @param error 错误对象
 * @returns ApiError 对象
 */
export const handleErrorWithToast = (error: any): ApiError => {
  const apiError = handleError(error);

  // 如果不是静默错误，可以获取错误消息
  // 显示 toast 的逻辑由调用方决定
  if (!apiError.details?.silent) {
    getErrorMessage(apiError);
  }

  return apiError;
};