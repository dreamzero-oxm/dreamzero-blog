export interface CreateArticleComment {
    article_id: string;
    article_title: string;
    content: string;
}

import { BaseModel } from './base';

export interface ArticleComment extends BaseModel {
    content: string;
    article_title: string;
    is_notify: boolean;
    is_read: boolean;
    is_pass: boolean;
}

export interface ListCommentsRequest {
    article_id?: string;
    page?: number;
    page_size?: number;
}

export interface ListCommentsResponse {
    comments: ArticleComment[];
    total: number;
    page: number;
    page_size: number;
}