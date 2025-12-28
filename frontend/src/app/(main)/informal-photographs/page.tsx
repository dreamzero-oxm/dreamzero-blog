/**
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/(main)/informal-photographs/page.tsx
 * @description 日常照片展示页面组件
 * @mainFunctionality 获取并展示日常照片列表，支持错误处理和加载状态
 * @author DreamZero Team
 * @lastModified 2023-12-01
 */

'use client' // 标记为客户端组件，因为使用了React hooks和事件处理

// 导入所需的依赖和组件
import { useUserDailyPhotographs } from '@/hooks/photo-hook' // 自定义Hook，用于获取用户日常照片列表
import { DailyPhotograph } from '@/interface/photo'; // 日常照片的类型定义
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // UI警告组件
import { Skeleton } from "@/components/ui/skeleton"; // UI骨架屏组件
import DecryptedText from '@/components/decrypted-text'; // 解密文本动画组件
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // UI卡片组件
import { Badge } from "@/components/ui/badge"; // UI徽章组件
import { Heart, Eye, Camera, MapPin, Calendar } from 'lucide-react'; // 图标组件

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
 * - 展示照片的详细信息（拍摄参数、位置等）
 */
export default function InformalPhotographs() {
  // 假设有一个默认的用户ID，实际应用中应该从用户上下文或认证状态中获取
  const defaultUserId = "b33ed0ca-6a5d-41a6-9e99-0c9d1db621ea"

  // 使用自定义Hook获取用户日常照片列表，包含加载状态、错误状态和照片数据
  const {isLoading, error, photos, total} = useUserDailyPhotographs({
    user_id: defaultUserId,
    page: 1,
    size: 20
  })

  return (
    // 页面容器：设置最大宽度、水平居中、内边距
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面标题：大号粗体字，底部有间距 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">日常照片</h1>
        <div className="text-sm text-gray-500">
          共 {total} 张照片
        </div>
      </div>

      {/* 内容容器：设置最大宽度、水平居中 */}
      <div className="max-w-7xl mx-auto">
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
        {isLoading ? (
          // 骨架屏网格：3列布局，间距4
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-4 w-full">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : photos && photos.length > 0 ? (
          // 正常状态处理：显示照片网格
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 遍历照片列表，渲染每张照片卡片 */}
            {photos.map((item) => (
              <PhotoCard key={item.id} photo={item} />
            ))}
          </div>
        ) : (
          // 空状态处理：显示空状态提示
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">暂无日常照片</div>
            <div className="text-gray-400 text-sm mt-2">请稍后再试或联系管理员</div>
          </div>
        )}
      </div>
    </div>
  )

  /**
   * @description 照片卡片组件
   * @param {Object} props - 组件属性
   * @param {DailyPhotograph} props.photo - 照片数据
   * @returns {JSX.Element} 照片卡片组件
   */
  function PhotoCard({ photo }: { photo: DailyPhotograph }) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* 照片图片容器 */}
        <div className="relative w-full h-48 overflow-hidden">
          <img
            // 图片URL：移除本地服务器前缀
            src={photo.image_url.replace('http://10.21.23.14:10004', '')}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />

          {/* 顶部标签 */}
          <div className="absolute top-2 left-2 flex space-x-2">
            {photo.is_public && (
              <Badge variant="secondary" className="bg-black bg-opacity-50 text-white">
                公开
              </Badge>
            )}
          </div>
        </div>

        {/* 卡片头部：标题 */}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{photo.title}</CardTitle>
        </CardHeader>

        {/* 卡片内容：描述和标签 */}
        <CardContent className="pb-2">
          {/* 照片描述 */}
          {photo.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {photo.description}
            </p>
          )}

          {/* 照片标签 */}
          {photo.tags && (
            <div className="flex flex-wrap gap-1 mb-3">
              {photo.tags.split(',').map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          {/* 拍摄信息 */}
          <div className="space-y-1 text-sm text-gray-500">
            {/* 拍摄日期 */}
            {photo.taken_at && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(photo.taken_at).toLocaleDateString()}</span>
              </div>
            )}

            {/* 拍摄地点 */}
            {photo.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{photo.location}</span>
              </div>
            )}

            {/* 相机信息 */}
            {photo.camera && (
              <div className="flex items-center space-x-1">
                <Camera className="w-3 h-3" />
                <span>{photo.camera}</span>
                {photo.lens && <span> · {photo.lens}</span>}
              </div>
            )}

            {/* 拍摄参数 */}
            {(photo.iso || photo.aperture || photo.shutter_speed || photo.focal_length) && (
              <div className="flex items-center space-x-1 text-xs">
                {photo.iso && <span>ISO {photo.iso}</span>}
                {photo.aperture && <span> · f/{photo.aperture}</span>}
                {photo.shutter_speed && <span> · {photo.shutter_speed}s</span>}
                {photo.focal_length && <span> · {photo.focal_length}mm</span>}
              </div>
            )}
          </div>
        </CardContent>

        {/* 卡片底部：统计信息 */}
        <CardFooter className="pt-2">
          <div className="flex justify-between items-center w-full text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{photo.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{photo.views}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    )
  }
}