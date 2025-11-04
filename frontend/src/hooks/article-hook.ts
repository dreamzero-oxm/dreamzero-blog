import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/utils/request';
import api from '@/lib/api';
import type { 
  CreateArticleRequest, 
  UpdateArticleRequest, 
  DeleteArticleRequest, 
  ListArticlesRequest, 
  UpdateArticleStatusRequest,
  LikeArticleRequest,
  ArticleListResponse,
  ArticleResponse,
  BaseArticleResponse
} from '@/interface/article';
import type { BaseResponse } from '@/interface/base';
import { handleError, ErrorType } from '@/utils/error-handler';
import type { Article } from '@/interface/article';
import type { CreateArticleComment } from "@/interface/article-comment"

const {
    submitArticleComment,
} = api;

// 获取文章列表
export function useGetArticles(params?: ListArticlesRequest) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: async (): Promise<BaseResponse<ArticleListResponse>> => {
      return get<BaseResponse<ArticleListResponse>>(api.articles, { 
        params,
        retries: 2,
        retryDelay: 1000,
        timeout: 15000
      });
    },
    retry: (failureCount, error) => {
      // 如果是认证错误，不重试
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      // 其他错误最多重试2次
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 获取单个文章
export function useGetArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async (): Promise<BaseResponse<ArticleResponse>> => {
      return get<BaseResponse<ArticleResponse>>(`${api.articles}/${id}`, {
        retries: 2,
        retryDelay: 1000,
        timeout: 15000
      });
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      // 如果是认证错误，不重试
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      // 其他错误最多重试2次
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 创建文章
export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateArticleRequest): Promise<BaseArticleResponse> => {
      return post<BaseArticleResponse>(api.articles, { 
        body: data,
        retries: 1,
        retryDelay: 1000,
        timeout: 30000
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error) => {
      const apiError = handleError(error);
      console.error('创建文章失败:', apiError.message);
      
      // 根据错误类型进行特定处理
      if (apiError.type === ErrorType.VALIDATION_ERROR) {
        // 可以在这里添加表单验证错误的处理
      } else if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
        // 可以在这里添加认证错误的处理，如跳转到登录页
      }
    },
  });
}

// 更新文章
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateArticleRequest): Promise<BaseArticleResponse> => {
      return put<BaseArticleResponse>(`${api.articles}/${data.id}`, { 
        body: data,
        retries: 1,
        retryDelay: 1000,
        timeout: 30000
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
    },
    onError: (error) => {
      const apiError = handleError(error);
      console.error('更新文章失败:', apiError.message);
      
      // 根据错误类型进行特定处理
      if (apiError.type === ErrorType.VALIDATION_ERROR) {
        // 可以在这里添加表单验证错误的处理
      } else if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
        // 可以在这里添加认证错误的处理，如跳转到登录页
      }
    },
  });
}

// 删除文章
export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DeleteArticleRequest): Promise<BaseArticleResponse> => {
      return del<BaseArticleResponse>(`${api.articles}/${data.id}`, {
        retries: 1,
        retryDelay: 1000,
        timeout: 15000
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error) => {
      const apiError = handleError(error);
      console.error('删除文章失败:', apiError.message);
      
      // 根据错误类型进行特定处理
      if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
        // 可以在这里添加认证错误的处理，如跳转到登录页
      } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
        // 可以在这里添加权限错误的处理
      }
    },
  });
}

// 更新文章状态
export function useUpdateArticleStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateArticleStatusRequest): Promise<BaseArticleResponse> => {
      return put<BaseArticleResponse>(`${api.articles}/${data.id}/status`, { 
        body: data,
        retries: 1,
        retryDelay: 1000,
        timeout: 15000
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
    },
    onError: (error) => {
      const apiError = handleError(error);
      console.error('更新文章状态失败:', apiError.message);
      
      // 根据错误类型进行特定处理
      if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
        // 可以在这里添加认证错误的处理，如跳转到登录页
      } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
        // 可以在这里添加权限错误的处理
      }
    },
  });
}

// 点赞文章
export function useLikeArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LikeArticleRequest): Promise<BaseArticleResponse> => {
      return post<BaseArticleResponse>(`${api.articles}/${data.id}/like`, {
        retries: 1,
        retryDelay: 1000,
        timeout: 10000
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
    },
    onError: (error) => {
      const apiError = handleError(error);
      console.error('点赞文章失败:', apiError.message);
      
      // 根据错误类型进行特定处理
      if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
        // 可以在这里添加认证错误的处理，如跳转到登录页
      } else if (apiError.type === ErrorType.NETWORK_ERROR) {
        // 可以在这里添加网络错误的处理，如显示重试按钮
      }
    },
  });
}



// 根据用户角色获取文章的请求参数
export interface GetArticlesByRoleRequest {
  page?: number;
  page_size?: number;
  status?: string;
  tag?: string;
  tags?: string[];
  title?: string;
  sort_by?: string;
  sort_dir?: string;
}

// 根据用户角色获取文章的响应数据
export interface GetArticlesByRoleResponse {
  articles: Article[];
  total: number;
}

// 根据用户角色获取文章的Hook
export function useGetArticlesByRole(params?: GetArticlesByRoleRequest) {
  return useQuery({
    queryKey: ['articles-by-role', params],
    queryFn: async (): Promise<BaseResponse<GetArticlesByRoleResponse>> => {
      return get<BaseResponse<GetArticlesByRoleResponse>>('/api/v1/articles/by-role', { 
        params,
        timeout: 15000
      });
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}


export function useSubmitComment() {
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (postData: CreateArticleComment) => {
            // 创建 FormData 对象
            const formData = new FormData();
            formData.append('comment', postData.content);
            formData.append('article_title', postData.article_title);
            // fetch 会自动设置正确的 Content-Type 和边界
            return post<BaseResponse>(submitArticleComment, {
                body: formData,
            });
        },
        onSuccess(data) {
            if (data.code !== 0) {
                // 如果返回的 code 不为 0，则抛出错误
                throw new Error(data.msg || '评论提交失败');
            }
        },
    });
    return {
        isPending,
        data,
        error,
        mutate,
    }
}