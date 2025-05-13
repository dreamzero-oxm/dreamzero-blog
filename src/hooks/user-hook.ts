'use client'

import api from "@/lib/api";
import { post, get } from "@/utils/request";
import type { UserLoginRequest, UserLoginResponse } from "@/interface/user";
import type { BaseResponse } from "@/interface/base";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";


const {
    userLogin,
    userEmailVerificationCode,
    userVerifyEmailVerificationCode,
    userCheckUserName,
    userRegister,
    userCheckEmail,
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
                    localStorage.setItem("token", response?.token ?? "");
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
        localStorage.removeItem("token");
        router.push('/login');
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