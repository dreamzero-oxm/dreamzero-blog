export interface UserLoginRequest {
    account: string;
    password: string;
}

import { BaseModel } from './base';

export interface User extends BaseModel {
    user_name: string;
    nickname: string;
    email: string;
    avatar: string;
    bio: string;
    website: string;
    location: string;
    birthday: string;
    gender: string;
    phone: string;
    is_locked: boolean;
    lock_until: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserProfile extends User {
    // 所有字段已在User接口中定义
}

export interface UpdateUserProfileRequest {
    nickname?: string;
    email?: string;
    avatar?: string;
    bio?: string;
    website?: string;
    location?: string;
    birthday?: string;
    gender?: string;
    phone?: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}

export interface OperationLog extends BaseModel {
    user_id: string;
    user_name: string;
    operation_type: string;
    operation_desc: string;
    request_ip: string;
    user_agent: string;
    request_data: string;
    response_data: string;
    status: string;
    error_message: string;
    operation_time: string;
}

export interface UserLoginResponse {
  success: boolean;
  user: User;
  access_token: string;
  refresh_token: string;
}