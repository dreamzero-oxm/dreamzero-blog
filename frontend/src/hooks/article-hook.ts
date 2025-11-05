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
} from '@/interface/article';
import type { BaseResponse } from '@/interface/base';
import { handleError, ErrorType } from '@/utils/error-handler';
import type { Article } from '@/interface/article';
import { toast } from 'sonner';
// @ts-ignore - react-hot-toast types may not be available

// 评论响应类型定义
interface CommentResponse {
  id: string;
  content: string;
  articleId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

/**
 * 获取文章列表
 * @param params 查询参数，包括分页、筛选条件等
 * @returns 包含文章列表数据的查询对象
 */
export function useGetArticles(params?: ListArticlesRequest) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: async (): Promise<BaseResponse<ArticleListResponse>> => {
      try {
        return await get<BaseResponse<ArticleListResponse>>(api.articles, { 
          params,
          timeout: 15000
        });
      } catch (error) {
        const apiError = handleError(error);
        
        // 根据错误类型进行特定处理
        if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
          toast.error('请先登录后再查看文章列表');
        } else if (apiError.type === ErrorType.NETWORK_ERROR) {
          toast.error('网络连接异常，请检查网络后重试');
        } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
          toast.error('您没有权限查看文章列表');
        } else if (apiError.type === ErrorType.NOT_FOUND_ERROR) {
          toast.error('请求的文章列表不存在');
        } else {
          toast.error(`获取文章列表失败: ${apiError.message}`);
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟后从内存中移除
    refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
    refetchOnReconnect: true, // 网络重连时自动刷新
  });
}

/**
 * 获取单个文章
 * @param id 文章ID
 * @returns 包含文章数据的查询对象
 */
export function useGetArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async (): Promise<BaseResponse<ArticleResponse>> => {
      try {
        return await get<BaseResponse<ArticleResponse>>(`${api.articles}/${id}`, {
          timeout: 15000
        });
      } catch (error) {
        const apiError = handleError(error);
        
        // 根据错误类型进行特定处理
        if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
          toast.error('请先登录后再查看文章');
        } else if (apiError.type === ErrorType.NOT_FOUND_ERROR) {
          toast.error('文章不存在或已被删除');
        } else if (apiError.type === ErrorType.NETWORK_ERROR) {
          toast.error('网络连接异常，请检查网络后重试');
        } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
          toast.error('您没有权限查看此文章');
        } else {
          toast.error(`获取文章失败: ${apiError.message}`);
        }
        
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟后从内存中移除
    refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
    refetchOnReconnect: true, // 网络重连时自动刷新
  });
}

/**
 * 创建文章
 * @returns 包含创建文章功能的变更对象
 */
export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateArticleRequest): Promise<BaseResponse<ArticleResponse>> => {
      try {
        return await post<BaseResponse<ArticleResponse>>(api.articles, { 
          body: data,
          timeout: 30000
        });
      } catch (error) {
        const apiError = handleError(error);
        
        // 根据错误类型进行特定处理
        if (apiError.type === ErrorType.VALIDATION_ERROR) {
          toast.error('文章内容验证失败，请检查输入');
        } else if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
          toast.error('请先登录后再创建文章');
        } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
          toast.error('您没有权限创建文章');
        } else if (apiError.type === ErrorType.NETWORK_ERROR) {
          toast.error('网络连接异常，请检查网络后重试');
        } else {
          toast.error(`创建文章失败: ${apiError.message}`);
        }
        
        throw error;
      }
    },
    onSuccess: (response) => {
      // 使文章列表缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      
      // 如果创建成功，显示成功消息
      if (response.code === 0) {
        toast.success('文章创建成功');
        // 可以跳转到文章详情页或管理页
      } else {
        toast.error(response.msg || '创建文章失败');
      }
    },
    onMutate: async () => {
      // 取消任何进行中的获取文章列表的查询
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      
      // 获取之前的数据快照
      const previousArticles = queryClient.getQueryData(['articles']);
      
      // 乐观更新：假设创建成功，立即更新UI
      // 这里可以根据实际需求实现乐观更新
      
      // 返回包含上下文信息的对象
      return { previousArticles };
    },
    onError: (error, variables, context) => {
      // 如果发生错误，恢复之前的数据
      if (context?.previousArticles) {
        queryClient.setQueryData(['articles'], context.previousArticles);
      }
    },
    onSettled: () => {
      // 无论成功还是失败，都重新获取文章列表
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

/**
 * 更新文章
 * @returns 包含更新文章功能的变更对象
 */
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateArticleRequest): Promise<BaseResponse<ArticleResponse>> => {
      try {
        return await put<BaseResponse<ArticleResponse>>(`${api.articles}/${data.id}`, { 
          body: data,
          timeout: 30000
        });
      } catch (error) {
        const apiError = handleError(error);
        
        // 根据错误类型进行特定处理
        if (apiError.type === ErrorType.VALIDATION_ERROR) {
          toast.error('文章内容验证失败，请检查输入');
        } else if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
          toast.error('请先登录后再更新文章');
        } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
          toast.error('您没有权限更新此文章');
        } else if (apiError.type === ErrorType.NOT_FOUND_ERROR) {
          toast.error('文章不存在或已被删除');
        } else if (apiError.type === ErrorType.NETWORK_ERROR) {
          toast.error('网络连接异常，请检查网络后重试');
        } else {
          toast.error(`更新文章失败: ${apiError.message}`);
        }
        
        throw error;
      }
    },
    onSuccess: (response) => {
      // 使文章列表和单个文章缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', response.data?.id] });
      
      // 如果更新成功，显示成功消息
      if (response.code !== 0) {
        toast.error(response.msg || '更新文章失败');
      }
    },
    onMutate: async (variables) => {
      // 取消任何进行中的获取文章列表和单个文章的查询
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      await queryClient.cancelQueries({ queryKey: ['article', variables.id] });
      
      // 获取之前的数据快照
      const previousArticles = queryClient.getQueryData(['articles']);
      const previousArticle = queryClient.getQueryData(['article', variables.id]);
      
      // 乐观更新：假设更新成功，立即更新UI
      if (previousArticle) {
        queryClient.setQueryData(['article', variables.id], (old: any) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              ...variables
            }
          };
        });
      }
      
      // 返回包含上下文信息的对象
      return { previousArticles, previousArticle };
    },
    onError: (error, variables, context) => {
      // 如果发生错误，恢复之前的数据
      if (context?.previousArticles) {
        queryClient.setQueryData(['articles'], context.previousArticles);
      }
      if (context?.previousArticle) {
        queryClient.setQueryData(['article', variables.id], context.previousArticle);
      }
    },
    onSettled: (_, __, variables) => {
      // 无论成功还是失败，都重新获取文章列表和单个文章
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
    },
  });
}

/**
 * 删除文章
 * @returns 包含删除文章功能的变更对象
 */
export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DeleteArticleRequest): Promise<BaseResponse<ArticleResponse>> => {
      try {
        return await del<BaseResponse<ArticleResponse>>(`${api.articles}/${data.id}`, {
          timeout: 15000
        });
      } catch (error) {
        const apiError = handleError(error);
        
        // 根据错误类型进行特定处理
        if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
          toast.error('请先登录后再删除文章');
        } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
          toast.error('您没有权限删除此文章');
        } else if (apiError.type === ErrorType.NOT_FOUND_ERROR) {
          toast.error('文章不存在或已被删除');
        } else if (apiError.type === ErrorType.NETWORK_ERROR) {
          toast.error('网络连接异常，请检查网络后重试');
        } else {
          toast.error(`删除文章失败: ${apiError.message}`);
        }
        
        throw error;
      }
    },
    onSuccess: (response) => {
      // 使文章列表缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      
      // 如果删除成功，显示成功消息
      if (response.code === 0) {
        toast.success('文章删除成功');
        
        // 可以跳转到文章列表页或管理页
      } else {
        toast.error(response.msg || '删除文章失败');
      }
    },
    onMutate: async (variables) => {
      // 取消任何进行中的获取文章列表的查询
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      
      // 获取之前的数据快照
      const previousArticles = queryClient.getQueryData(['articles']);
      
      // 乐观更新：假设删除成功，立即从列表中移除文章
      if (previousArticles) {
        queryClient.setQueryData(['articles'], (old: any) => {
          if (!old || !old.data || !Array.isArray(old.data.records)) return old;
          return {
            ...old,
            data: {
              ...old.data,
              records: old.data.records.filter((article: any) => article.id !== variables.id)
            }
          };
        });
      }
      
      // 返回包含上下文信息的对象
      return { previousArticles };
    },
    onError: (error, variables, context) => {
      // 如果发生错误，恢复之前的数据
      if (context?.previousArticles) {
        queryClient.setQueryData(['articles'], context.previousArticles);
      }
    },
    onSettled: () => {
      // 无论成功还是失败，都重新获取文章列表
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

/**
 * 更新文章状态
 * @returns 包含更新文章状态功能的变更对象
 */
export function useUpdateArticleStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateArticleStatusRequest): Promise<BaseResponse<ArticleResponse>> => {
      try {
        return await put<BaseResponse<ArticleResponse>>(`${api.articles}/${data.id}/status`, { 
          body: data,
          timeout: 15000
        });
      } catch (error) {
        const apiError = handleError(error);
        
        // 根据错误类型进行特定处理
        if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
          toast.error('请先登录后再更新文章状态');
        } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
          toast.error('您没有权限更新此文章状态');
        } else if (apiError.type === ErrorType.NOT_FOUND_ERROR) {
          toast.error('文章不存在或已被删除');
        } else if (apiError.type === ErrorType.NETWORK_ERROR) {
          toast.error('网络连接异常，请检查网络后重试');
        } else {
          toast.error(`更新文章状态失败: ${apiError.message}`);
        }
        
        throw error;
      }
    },
    onSuccess: (response, variables) => {
      // 使文章列表和单个文章缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
      
      // 如果更新成功，显示成功消息
      if (response.code === 0) {
        const statusText = variables.status === 'published' ? '发布' : 
                           variables.status === 'draft' ? '草稿' : '私有';
        toast.success(`文章已${statusText}`);
      } else {
        toast.error(response.msg || '更新文章状态失败');
      }
    },
    onMutate: async (variables) => {
      // 取消任何进行中的获取文章列表和单个文章的查询
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      await queryClient.cancelQueries({ queryKey: ['article', variables.id] });
      
      // 获取之前的数据快照
      const previousArticles = queryClient.getQueryData(['articles']);
      const previousArticle = queryClient.getQueryData(['article', variables.id]);
      
      // 乐观更新：假设更新成功，立即更新UI
      if (previousArticle) {
        queryClient.setQueryData(['article', variables.id], (old: any) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              status: variables.status
            }
          };
        });
      }
      
      if (previousArticles) {
        queryClient.setQueryData(['articles'], (old: any) => {
          if (!old || !old.data || !Array.isArray(old.data.records)) return old;
          return {
            ...old,
            data: {
              ...old.data,
              records: old.data.records.map((article: any) => 
                article.id === variables.id ? { ...article, status: variables.status } : article
              )
            }
          };
        });
      }
      
      // 返回包含上下文信息的对象
      return { previousArticles, previousArticle };
    },
    onError: (error, variables, context) => {
      // 如果发生错误，恢复之前的数据
      if (context?.previousArticles) {
        queryClient.setQueryData(['articles'], context.previousArticles);
      }
      if (context?.previousArticle) {
        queryClient.setQueryData(['article', variables.id], context.previousArticle);
      }
    },
    onSettled: (_, __, variables) => {
      // 无论成功还是失败，都重新获取文章列表和单个文章
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
    },
  });
}

/**
 * 点赞文章
 * @returns 包含点赞文章功能的变更对象
 */
export function useLikeArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LikeArticleRequest): Promise<BaseResponse<ArticleResponse>> => {
      try {
        return await post<BaseResponse<ArticleResponse>>(`${api.articles}/${data.id}/like`, {
          timeout: 15000
        });
      } catch (error) {
        const apiError = handleError(error);
        
        // 根据错误类型进行特定处理
        if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
          toast.error('请先登录后再点赞文章');
        } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
          toast.error('您没有权限点赞此文章');
        } else if (apiError.type === ErrorType.NOT_FOUND_ERROR) {
          toast.error('文章不存在或已被删除');
        } else if (apiError.type === ErrorType.NETWORK_ERROR) {
          toast.error('网络连接异常，请检查网络后重试');
        } else {
          toast.error(`点赞文章失败: ${apiError.message}`);
        }
        
        throw error;
      }
    },
    onSuccess: (response, variables) => {
      // 使文章列表和单个文章缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
      
      // 如果点赞成功，显示成功消息
      if (response.code === 0) {
        toast.success('点赞成功');
      } else {
        toast.error(response.msg || '点赞失败');
      }
    },
    onMutate: async (variables) => {
      // 取消任何进行中的获取文章列表和单个文章的查询
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      await queryClient.cancelQueries({ queryKey: ['article', variables.id] });
      
      // 获取之前的数据快照
      const previousArticles = queryClient.getQueryData(['articles']);
      const previousArticle = queryClient.getQueryData(['article', variables.id]);
      
      // 乐观更新：假设点赞成功，立即更新UI
      if (previousArticle) {
        queryClient.setQueryData(['article', variables.id], (old: any) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              likeCount: (old.data.likeCount || 0) + 1,
              isLiked: true
            }
          };
        });
      }
      
      if (previousArticles) {
        queryClient.setQueryData(['articles'], (old: any) => {
          if (!old || !old.data || !Array.isArray(old.data.records)) return old;
          return {
            ...old,
            data: {
              ...old.data,
              records: old.data.records.map((article: any) => 
                article.id === variables.id 
                  ? { ...article, likeCount: (article.likeCount || 0) + 1, isLiked: true }
                  : article
              )
            }
          };
        });
      }
      
      // 返回包含上下文信息的对象
      return { previousArticles, previousArticle };
    },
    onError: (error, variables, context) => {
      // 如果发生错误，恢复之前的数据
      if (context?.previousArticles) {
        queryClient.setQueryData(['articles'], context.previousArticles);
      }
      if (context?.previousArticle) {
        queryClient.setQueryData(['article', variables.id], context.previousArticle);
      }
    },
    onSettled: (_, __, variables) => {
      // 无论成功还是失败，都重新获取文章列表和单个文章
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
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


/**
 * 提交评论
 * @returns 包含提交评论功能的变更对象
 */
export function useSubmitComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, content }: { articleId: string; content: string }): Promise<BaseResponse<CommentResponse>> => {
      try {
        return await post<BaseResponse<CommentResponse>>(`${api.articles}/${articleId}/comments`, {
          body: { content },
          timeout: 15000
        });
      } catch (error) {
        const apiError = handleError(error);
        
        // 根据错误类型进行特定处理
        if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
          toast.error('请先登录后再发表评论');
        } else if (apiError.type === ErrorType.AUTHORIZATION_ERROR) {
          toast.error('您没有权限发表评论');
        } else if (apiError.type === ErrorType.NOT_FOUND_ERROR) {
          toast.error('文章不存在或已被删除');
        } else if (apiError.type === ErrorType.NETWORK_ERROR) {
          toast.error('网络连接异常，请检查网络后重试');
        } else {
          toast.error(`发表评论失败: ${apiError.message}`);
        }
        
        throw error;
      }
    },
    onSuccess: (response, { articleId }) => {
      // 使文章和评论缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      
      // 如果评论成功，显示成功消息
      if (response.code === 0) {
        toast.success('评论发表成功');
      } else {
        toast.error(response.msg || '发表评论失败');
      }
    },
    onMutate: async ({ articleId, content }) => {
      // 取消任何进行中的获取文章和评论的查询
      await queryClient.cancelQueries({ queryKey: ['article', articleId] });
      await queryClient.cancelQueries({ queryKey: ['comments', articleId] });
      
      // 获取之前的数据快照
      const previousArticle = queryClient.getQueryData(['article', articleId]);
      const previousComments = queryClient.getQueryData(['comments', articleId]);
      
      // 乐观更新：假设评论成功，立即更新UI
      if (previousComments) {
        // 创建一个临时评论对象
        const tempComment = {
          id: `temp-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          // 其他必要的字段...
        };
        
        queryClient.setQueryData(['comments', articleId], (old: any) => {
          if (!old || !old.data || !Array.isArray(old.data.records)) return old;
          return {
            ...old,
            data: {
              ...old.data,
              records: [tempComment, ...old.data.records]
            }
          };
        });
      }
      
      // 返回包含上下文信息的对象
      return { previousArticle, previousComments };
    },
    onError: (error, { articleId }, context) => {
      // 如果发生错误，恢复之前的数据
      if (context?.previousArticle) {
        queryClient.setQueryData(['article', articleId], context.previousArticle);
      }
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', articleId], context.previousComments);
      }
    },
    onSettled: (_, __, { articleId }) => {
      // 无论成功还是失败，都重新获取文章和评论
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    },
  });
}