'use client'

import api from "@/lib/api";
import { post, get } from "@/utils/request";
import type { UserLoginRequest, UserLoginResponse, UserProfile, UpdateUserProfileRequest, ChangePasswordRequest, OperationLog } from "@/interface/user";
import type { BaseResponse } from "@/interface/base";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

const {
    userLogin,
    userEmailVerificationCode,
    userVerifyEmailVerificationCode,
    userCheckUserName,
    userRegister,
    userCheckEmail,
    getUserProfile,
    updateUserProfile,
    uploadAvatar,
    changePassword,
    getOperationLogs,
} = api;

export function useUserLogin() {
    const router = useRouter()
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (postData: UserLoginRequest) => {
            // 创建 FormData 对象
            const formData = new FormData();
            formData.append('account', postData.account);
            formData.append('password', postData.password);
            // fetch 会自动设置正确的 Content-Type 和边界
            return post<BaseResponse>(userLogin, {
                body: formData
            })
        },
        onSuccess(data) {
            if (data.code !== 0){
                throw new Error(data.msg);
            }else {
                const response: UserLoginResponse = data.data;
                if (response.success) {
                    // 存储access_token和refresh_token到localStorage
                    localStorage.setItem("access_token", response?.access_token ?? "");
                    localStorage.setItem("refresh_token", response?.refresh_token ?? "");
                    // 触发自定义事件，通知其他组件token已更新
                    window.dispatchEvent(new Event('tokenChange'));
                    router.push('/');
                }else{
                    throw new Error(data.msg);
                }
            }
        },
    })
    return {
        isPending,
        data,
        error,
        mutate,
    }
}

export function useUserLogout() {
    const router = useRouter()
    return () => {
        // 清除access_token和refresh_token
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // 触发自定义事件，通知其他组件token已清除
        window.dispatchEvent(new Event('tokenChange'));
        router.refresh();
    }
}

export function useUserGetEmailVerificationCode() {
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (email: string) => {
            return get<BaseResponse>(userEmailVerificationCode, {
                params: {
                    email: email,
                }
            })
        },
        onSuccess(data) {
            if (data.code !== 0) {
                throw new Error(data.msg);
            }
        },
    })
    return {
        isPending,
        data,
        error,
        mutate,
    }
}

export function useUserVerifyEmailVerificationCode() {
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (postData: {email: string, verification_code: string}) => {
            return post<BaseResponse>(userVerifyEmailVerificationCode, {
                body: postData
            })
        },
        onSuccess(data) {
            if (data.code !== 0) {
                throw new Error(data.msg);
            }
        },
    })
    return {
        isPending,
        data,
        error,
        mutate,
    }
}

export function useUserCheckUserName() {
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (userName: string) => {
            return get<BaseResponse>(userCheckUserName, {
                params: {
                    user_name: userName,
                }
            })
        },
        onSuccess(data) {
            if (data.code!== 0) {
                throw new Error(data.msg);
            }
        }
    })
    return {
        isPending,
        data,
        error,
        mutate,
    }
}

export function useUserCheckEmail() {
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (email: string) => {
            return get<BaseResponse>(userCheckEmail, {
                params: {
                    email: email,
                }
            })
        },
        onSuccess(data) {
            if (data.code!== 0) {
                throw new Error(data.msg);
            }
        }
    })
    return {
        isPending,
        data,
        error,
        mutate,
    }
}


export function useUserRegister() {
    const router = useRouter()
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (postData: {user_name: string, password: string, email: string, verification_code: string}) => {
            return post<BaseResponse>(userRegister, {
                body: postData
            })
        },
        onSuccess(data) {
            if (data.code!== 0) {
                throw new Error(data.msg);
            }else {
                router.push('/login');
            }
        },
        onError(error) {
            toast.error("登录失败", {
                description: `[${new Date().toLocaleString('zh-CN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                })}] ${error.message}`,
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            })
        }
    })
    return {
        isPending,
        data,
        error,
        mutate,
    }
}

// 获取用户个人信息
export function useGetUserProfile() {
    const {isPending, data, error, refetch} = useQuery({
        queryKey: ['userProfile'],
        queryFn: () => get<BaseResponse<UserProfile>>(getUserProfile),
        staleTime: 5 * 60 * 1000, // 5分钟
    })
    
    return {
        isPending,
        data,
        error,
        refetch,
    }
}

// 更新用户个人信息
export function useUpdateUserProfile() {
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (postData: UpdateUserProfileRequest) => {
            return post<BaseResponse<UserProfile>>(updateUserProfile, {
                body: postData
            })
        },
        onSuccess(data) {
            if (data.code !== 0) {
                throw new Error(data.msg);
            } else {
                toast.success("个人信息更新成功");
            }
        },
        onError(error) {
            toast.error("更新失败", {
                description: error.message,
            });
        }
    })
    
    return {
        isPending,
        data,
        error,
        mutate,
    }
}

// 上传头像
export function useUploadAvatar() {
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (fileOrBlob: File | Blob) => {
            const formData = new FormData();
            formData.append('avatar', fileOrBlob);
            return post<BaseResponse<{avatar_url: string}>>(uploadAvatar, {
                body: formData
            })
        },
        onSuccess(data) {
            if (data.code !== 0) {
                throw new Error(data.msg);
            } else {
                toast.success("头像上传成功");
            }
        },
        onError(error) {
            toast.error("头像上传失败", {
                description: error.message,
            });
        }
    })
    
    return {
        isPending,
        data,
        error,
        mutate,
    }
}

// 修改密码
export function useChangePassword() {
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (postData: ChangePasswordRequest) => {
            return post<BaseResponse>(changePassword, {
                body: postData
            })
        },
        onSuccess(data) {
            if (data.code !== 0) {
                throw new Error(data.msg);
            } else {
                toast.success("密码修改成功，请重新登录");
                // 清除token，强制重新登录
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.dispatchEvent(new Event('tokenChange'));
                window.location.href = '/login';
            }
        },
        onError(error) {
            toast.error("密码修改失败", {
                description: error.message,
            });
        }
    })
    
    return {
        isPending,
        data,
        error,
        mutate,
    }
}

// 获取操作日志
export function useGetOperationLogs(page: number = 1, pageSize: number = 10) {
    const {isPending, data, error, refetch} = useQuery({
        queryKey: ['operationLogs', page, pageSize],
        queryFn: () => get<BaseResponse<{logs: OperationLog[], total: number}>>(getOperationLogs, {
            params: {
                page,
                page_size: pageSize
            }
        }),
        staleTime: 5 * 60 * 1000, // 5分钟
    })
    
    return {
        isPending,
        data,
        error,
        refetch,
    }
}