import { BaseModel } from './base';

export interface PhotoListItem extends BaseModel {
    image_url: string;
    title: string;
}

export interface DailyPhotograph extends BaseModel {
    image_url: string;
    title: string;
    description?: string;
    tags?: string;
    user_id: string;
    taken_at?: string;
    location?: string;
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: number;
    shutter_speed?: number;
    focal_length?: number;
    is_public: boolean;
    likes: number;
    views: number;
}

export interface ListPhotosResponse {
    photos: DailyPhotograph[];
    total: number;
}

export interface GetUserDailyPhotographsParams {
    user_id: string;
    page?: number;
    size?: number;
}

export interface GetDailyPhotographsByDateRangeParams {
    user_id: string;
    start_date: string;
    end_date: string;
    page?: number;
    size?: number;
}