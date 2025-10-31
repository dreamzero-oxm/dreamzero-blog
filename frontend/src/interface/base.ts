export interface BaseResponse<T = any> {
    code: number,
    msg: string,
    data?: T
}

export interface BaseModel {
    id: string;
    created_at: string;
    updated_at: string;
}