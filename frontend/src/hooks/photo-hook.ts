import { useQuery } from '@tanstack/react-query'
import { get } from '@/utils/request'
import api from '@/lib/api'
import type { BaseResponse } from '@/interface/base'
import { PhotoListItem } from '@/interface/photo';

const {
    // updatePhotos,
    listPhotos,
} = api

export function useListPhoto() {
    const { isLoading, error, data: photoList } = useQuery({
        queryKey: ['photoList'],
        queryFn: async () => {
            const res = await get<BaseResponse>(listPhotos)
            if (res.code === 0) {
                return res.data as PhotoListItem[]
            }
            throw new Error(`[List photo error] code: ${res.code} | msg: ${res.msg}`)
        }
    })
    return {
        isLoading,
        error,
        photoList
    }
}