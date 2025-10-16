"use client"

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import type { CreateArticleComment } from "@/interface/article-comment"
import { useSubmitComment } from "@/hooks/artical-comment-hook"

interface CommentProps {
    // 文章title
    title: string[]
}

export default function CommentBox({title}: CommentProps) {
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { isPending, error, mutate: mutateAddComment } = useSubmitComment()

    useEffect(() => {
        if (isSubmitting && isPending) {
            return
        }else if (isSubmitting && !isPending) {
            setIsSubmitting(false)
            if (error === null) {
                // 成功后关闭抽屉
                document.getElementById('drawer-close-button')?.click()
            }
        }else if (!isSubmitting && isPending) {
            // 不应该出现这种情况
            return
        }else {
            return
        }
    }, [isPending, isSubmitting, error]);

    // 提交评论
    const handleSubmit = async () => {
        if (!comment.trim()) return
        
        try {
            setIsSubmitting(true)
            mutateAddComment({
                comment: comment,
                articleTitle: title
            } as CreateArticleComment)
            setComment("")
        } catch (error) {
            console.error('提交评论失败:', error)
        } 
    }

    return (
        <Drawer >
            <DrawerTrigger>点击此处进行评论</DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>发表评论</DrawerTitle>
                    <DrawerDescription>
                        欢迎分享您的想法和建议。请注意保持友善，评论提交后将立即显示。
                    </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                    <Textarea
                        placeholder="请输入评论内容"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full h-[150px]"
                        disabled={isSubmitting}
                    />
                    <div>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting || !comment.trim()}
                            className="w-full"
                        >
                            {isSubmitting ? '提交中...' : '提交评论'}
                        </Button>
                    </div>
                    <DrawerClose id="drawer-close-button">
                        <div className="w-full h-auto py-1 rounded-xl border-2">
                            退出评论
                        </div>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    )
}