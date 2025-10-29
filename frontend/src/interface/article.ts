export interface Article {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'private';
  user_id: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  cover_image?: string;
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
  keyword?: string;
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
  code: number;
  msg: string;
  data: {
    articles: Article[];
    total: number;
    page: number;
    page_size: number;
  };
}

export interface ArticleResponse {
  code: number;
  msg: string;
  data: Article;
}

export interface BaseArticleResponse {
  code: number;
  msg: string;
  data?: any;
}