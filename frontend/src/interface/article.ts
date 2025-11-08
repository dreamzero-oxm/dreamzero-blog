import { BaseModel } from './base';

export interface Article extends BaseModel {
  title: string;
  content: string;
  summary: string;
  status: 'draft' | 'published' | 'private';
  user_id: string;
  view_count: number;
  like_count: number;
  tags: string[];
  cover_image?: string;
  is_liked?: boolean;
  published_at?: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  summary: string;
  status: 'draft' | 'published' | 'private';
  tags: string[];
  cover_image?: string;
}

export interface UpdateArticleRequest {
  id: string;
  title?: string;
  content?: string;
  summary?: string;
  status?: 'draft' | 'published' | 'private';
  tags?: string[];
  cover_image?: string;
}

export interface DeleteArticleRequest {
  id: string;
}

export interface GetArticleRequest {
  id: string;
}

export interface ListArticlesRequest {
  page?: number;
  page_size?: number;
  nickname?: string;  // 作者昵称查询
  tags?: string[];  // 多个标签查询
  title?: string;  // 文章标题查询
  sort_by?: 'created_at' | 'view_count' | 'like_count';  // 排序字段
  sort_order?: 'asc' | 'desc';  // 排序顺序
}

export interface ListArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  page_size: number;
}

export interface UpdateArticleStatusRequest {
  id: string;
  status: 'draft' | 'published' | 'private';
}

export interface LikeArticleRequest {
  id: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  page_size: number;
}

export type ArticleResponse = Article 
