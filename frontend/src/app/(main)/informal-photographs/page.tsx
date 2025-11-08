/**
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/(main)/informal-photographs/page.tsx
 * @description 日常照片展示页面组件
 * @mainFunctionality 获取并展示日常照片列表，支持错误处理和加载状态
 * @author DreamZero Team
 * @lastModified 2023-12-01
 */

'use client' // 标记为客户端组件，因为使用了React hooks和事件处理

// 导入所需的依赖和组件
import Image from 'next/image'; // Next.js的图片优化组件
import ImageList from '@mui/material/ImageList'; // Material-UI的图片列表组件
import ImageListItem from '@mui/material/ImageListItem'; // Material-UI的图片列表项组件
import { useListPhoto } from '@/hooks/photo-hook' // 自定义Hook，用于获取照片列表
import { useState, useEffect } from 'react'; // React的状态管理和副作用Hook
import { PhotoListItem } from '@/interface/photo'; // 照片列表项的类型定义
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // UI警告组件
import { Skeleton } from "@/components/ui/skeleton"; // UI骨架屏组件
import DecryptedText from '@/components/decrypted-text'; // 解密文本动画组件

/**
 * @description 日常照片展示页面组件
 * @component InformalPhotographs
 * @returns {JSX.Element} 返回日常照片展示页面的JSX结构
 * 
 * 页面功能：
 * - 获取并展示日常照片列表
 * - 处理加载状态和错误状态
 * - 使用Material-UI组件展示照片网格
 * - 提供错误提示和解密文本动画效果
 */
export default function InformalPhotographs() {
  // 照片列表状态：存储照片数据
  const [list, setList] = useState<PhotoListItem[]>([])

  // 使用自定义Hook获取照片列表，包含加载状态、错误状态和照片数据
  const {isLoading, error, photoList} = useListPhoto()

  /**
   * @description 副作用Hook：监听照片列表和错误状态变化
   * @dependency [photoList, error] - 依赖项：照片列表和错误状态
   * @effect 当照片列表或错误状态变化时，更新本地照片列表状态
   */
  useEffect(() => {
    if (error) {
      // 如果有错误，清空照片列表
      setList([])
    }else if (photoList) {
      // 如果有照片数据，更新照片列表
      setList(photoList)
    }
  }, [photoList, error])

  return (
    // 页面容器：设置最大宽度、水平居中、内边距
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 页面标题：大号粗体字，底部有间距 */}
      <h1 className="text-4xl font-bold mb-4">日常照片</h1>
      {/* 内容容器：设置最大宽度、水平居中 */}
      <div className="max-w-3xl mx-auto">
        {/* 错误状态处理：显示错误提示 */}
        {error && (
          <Alert>
            {/* 错误标题：使用解密文本动画组件 */}
            <AlertTitle>
                <DecryptedText
                  text="链接服务器失败，请联系管理员"
                  animateOn="hover" // 鼠标悬停时触发动画
                  speed={100} // 动画速度
                  useOriginalCharsOnly={true} // 仅使用原始字符
                  maxIterations={30} // 最大迭代次数
                />
            </AlertTitle>
            {/* 错误描述：使用解密文本动画组件 */}
            <AlertDescription>
              <DecryptedText
                text='很抱歉，目前无法加载日常照片。可能的原因：
                1. 服务器暂时无法访问
                2. 网络连接不稳定
                3. 系统正在维护中
                
                建议您稍后再试，如果问题持续存在，请联系管理员处理。'
                animateOn="hover" // 鼠标悬停时触发动画
                speed={100} // 动画速度
                useOriginalCharsOnly={true}
                maxIterations={30}
              />
            </AlertDescription>
          </Alert>
        )}
        {/* 加载状态处理：显示骨架屏 */}
        {isLoading? (
          // 骨架屏容器：垂直布局，间距3，宽度100%
          <div className="flex flex-col space-y-3 w-[100%]">
            {/* 主要骨架屏：高度400px，宽度100%，圆角 */}
            <Skeleton className="h-[400px] w-[100%] rounded-xl" />
            {/* 次要骨架屏组：垂直布局，间距2 */}
            <div className="space-y-2">
              {/* 文本骨架屏：高度4，宽度90% */}
              <Skeleton className="h-4 w-[90%]" />
              {/* 文本骨架屏：高度4，宽度80% */}
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </div>
        ): (
          // 正常状态处理：显示照片列表
          // Material-UI图片列表：瀑布流布局，3列，间距8
          <ImageList variant='masonry' cols={3} gap={8}>
          {/* 遍历照片列表，渲染每张照片 */}
          {list.map((item) => (
            // 图片列表项：使用照片ID作为唯一key，圆角和溢出隐藏
            <ImageListItem key={item.id} className='rounded-lg overflow-hidden'>
              {/* Next.js图片组件：优化图片加载和显示 */}
              <Image
                // 图片URL：移除本地服务器前缀
                src={item.image_url.replace('http://10.21.23.14:10004', '')}
                width={248} // 图片宽度
                height={200} // 图片高度
                className='object-cover w-[248px] aspect-auto' // 样式：覆盖适应，宽度248px，宽高比自动
                alt={item.title} // 图片替代文本
                loading="lazy" // 懒加载图片
              />
            </ImageListItem>
          ))}
          </ImageList>
        )}
      </div>
    </div>
  )
}