"use client"

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { useListPhoto } from '@/hooks/photo-hook'
import { useState, useEffect } from 'react';
import { PhotoListItem } from '@/interface/photo';


export default function InformalPhotographs() {
  const [list, setList] = useState<PhotoListItem[]>([])

  const {error, photoList} = useListPhoto()

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
      <div className="max-w-3xl mx-auto ">
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
      </div>
    </div>
  )
}