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

// 获取文章列表
export function useGetArticles(params?: ListArticlesRequest) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: async (): Promise<ArticleListResponse> => {
      return get<ArticleListResponse>(api.articles, { params });
    },
  });
}

// 获取单个文章
export function useGetArticle(id: number) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async (): Promise<ArticleResponse> => {
      return get<ArticleResponse>(`${api.articles}/${id}`);
    },
    enabled: !!id,
  });
}

// 创建文章
export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateArticleRequest): Promise<BaseArticleResponse> => {
      return post<BaseArticleResponse>(api.articles, { body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

// 更新文章
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateArticleRequest): Promise<BaseArticleResponse> => {
      return put<BaseArticleResponse>(`${api.articles}/${data.id}`, { body: data });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
    },
  });
}

// 删除文章
export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DeleteArticleRequest): Promise<BaseArticleResponse> => {
      return del<BaseArticleResponse>(`${api.articles}/${data.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

// 更新文章状态
export function useUpdateArticleStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateArticleStatusRequest): Promise<BaseArticleResponse> => {
      return put<BaseArticleResponse>(`${api.articles}/${data.id}/status`, { body: data });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
    },
  });
}

// 点赞文章
export function useLikeArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LikeArticleRequest): Promise<BaseArticleResponse> => {
      return post<BaseArticleResponse>(`${api.articles}/${data.id}/like`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
    },
  });
}