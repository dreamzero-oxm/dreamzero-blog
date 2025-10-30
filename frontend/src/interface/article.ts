export interface Article {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  excerpt: string;
  summary?: string;
  status: 'draft' | 'published' | 'private';
  user_id: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  cover_image?: string;
  is_liked?: boolean;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'private';
  tags: string[];
  cover_image?: string;
}

export interface UpdateArticleRequest {
  id: number;
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'private';
  tags?: string[];
  cover_image?: string;
}

export interface DeleteArticleRequest {
  id: number;
}

export interface GetArticleRequest {
  id: number;
}

export interface ListArticlesRequest {
  page?: number;
  page_size?: number;
  status?: 'draft' | 'published' | 'private';
  tag?: string;  // 单个标签查询
  tags?: string[];  // 多个标签查询
  user_id?: number;  // 用户ID查询
  keyword?: string;  // 关键词搜索
}

export interface ListArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  page_size: number;
}

export interface UpdateArticleStatusRequest {
  id: number;
  status: 'draft' | 'published' | 'private';
}

export interface LikeArticleRequest {
  id: number;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  page_size: number;
}

export interface ArticleResponse {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  excerpt: string;
  summary?: string;
  status: 'draft' | 'published' | 'private';
  user_id: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  cover_image?: string;
  is_liked?: boolean;
}

export interface BaseArticleResponse {
  code: number;
  msg: string;
  data?: any;
}