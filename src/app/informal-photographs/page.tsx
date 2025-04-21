"use client"

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { useListPhoto } from '@/hooks/photo-hook'
import { useState, useEffect } from 'react';
import { PhotoListItem } from '@/interface/photo';
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import { Skeleton } from "@/components/skeleton";
import DecryptedText from '@/components/decrypted-text';

export default function InformalPhotographs() {
  const [list, setList] = useState<PhotoListItem[]>([])

  const {isLoading, error, photoList} = useListPhoto()

  useEffect(() => {
    if (error) {
      setList([])
    }else if (photoList) {
      setList(photoList)
    }
  }, [photoList, error])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">日常照片</h1>
      <div className="max-w-3xl mx-auto">
        {error && (
          <Alert>
            <AlertTitle>
                <DecryptedText
                  text="链接服务器失败，请联系管理员"
                  animateOn="hover"
                  speed={100}
                  useOriginalCharsOnly={true}
                  maxIterations={30}
                />
            </AlertTitle>
            <AlertDescription>
              <DecryptedText
                text='很抱歉，目前无法加载日常照片。可能的原因：
                1. 服务器暂时无法访问
                2. 网络连接不稳定
                3. 系统正在维护中
                
                建议您稍后再试，如果问题持续存在，请联系管理员处理。'
                animateOn="hover"
                speed={100}
                useOriginalCharsOnly={true}
                maxIterations={30}
              />
            </AlertDescription>
          </Alert>
        )}
        {isLoading? (
          <div className="flex flex-col space-y-3 w-[100%]">
            <Skeleton className="h-[400px] w-[100%] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </div>
        ): (
          <ImageList variant='masonry' cols={3} gap={8}>
          {list.map((item) => (
            <ImageListItem key={item.ID} className='rounded-lg overflow-hidden'>
              <img
                srcSet={`${item.image_url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                src={`${item.image_url}?w=248&fit=crop&auto=format`}
                alt={item.title}
                loading="lazy"
              />
            </ImageListItem>
          ))}
          </ImageList>
        )}
      </div>
    </div>
  )
}