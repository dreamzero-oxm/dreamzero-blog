import { BaseModel } from './base';

export interface PhotoListItem extends BaseModel {
    image_url: string;
    title: string;
}

export interface DailyPhotograph extends BaseModel {
    image_url: string;
    title: string;
}

export interface ListPhotosResponse {
    photos: DailyPhotograph[];
    total: number;
    page: number;
    page_size: number;
}