export interface UserLoginRequest {
    account: string;
    password: string;
}

export interface User {
    id: number;
    created_at: string;
    updated_at: string;
    user_name: string;
    nickname: string;
    email: string;
    avatar: string;
    is_locked: boolean;
    lock_until: string;
}

export interface UserLoginResponse {
  success: boolean;
  user: User;
  access_token: string;
  refresh_token: string;
}