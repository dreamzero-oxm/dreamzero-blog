import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { post } from "@/utils/request";
import type { CreateArticleComment } from "@/interface/article-comment"
import type { BaseResponse } from "@/interface/base"

const {
    submitArticleComment,
} = api;

export function useSubmitComment() {
    const {isPending, data, error, mutate} = useMutation({
        mutationFn: (postData: CreateArticleComment) => {
            // 创建 FormData 对象
            const formData = new FormData();
            formData.append('comment', postData.comment);
            postData.articleTitle.forEach(title => {
                formData.append('article_title', title);
            });
            // fetch 会自动设置正确的 Content-Type 和边界
            return post<BaseResponse>(submitArticleComment, {
                body: formData,
            });
        },
        onSuccess(data) {
            if (data.code !== 0) {
                // 如果返回的 code 不为 0，则抛出错误
                throw new Error(data.msg || '评论提交失败');
            }
        },
    });
    return {
        isPending,
        data,
        error,
        mutate,
    }
}