/**
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/test/page.tsx
 * @description 测试页面组件，用于测试令牌检查和刷新功能
 * @mainFunctionality 测试认证令牌的检查和刷新机制
 * @author DreamZero Team
 * @lastModified 2023-12-01
 */

'use client'

// 导入所需的依赖和组件
import {useCheckAndRefreshToken} from '@/hooks/auth-hook' // 自定义Hook，用于检查和刷新令牌
import { useEffect } from 'react'

/**
 * @description 测试页面组件
 * @component Page
 * @returns {JSX.Element} 返回测试页面的JSX结构
 * 
 * 页面功能：
 * - 在组件挂载时检查并刷新访问令牌
 * - 显示简单的测试文本
 */
export default function Page() {
    // 检查并刷新访问令牌
    const {checkAndRefresh} = useCheckAndRefreshToken('main')
    useEffect(()=>{
        checkAndRefresh()
    }, [])

    // 返回简单的测试页面
    return <div>test</div>
}