import api from "@/lib/api";
import { post } from "@/utils/request";
import type { UserLoginRequest, UserLoginResponse } from "@/interface/user";
import type { BaseResponse } from "@/interface/base";
import { useMutation } from "@tanstack/react-query";

const {
    userLogin,
} = api;

export function useUserLogin() {
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
                    window.location.href = "/";
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