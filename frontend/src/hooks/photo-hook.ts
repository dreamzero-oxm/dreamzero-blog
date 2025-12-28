import { useQuery } from '@tanstack/react-query'
import { get } from '@/utils/request'
import api from '@/lib/api'
import type { BaseResponse } from '@/interface/base'
import { PhotoListItem, DailyPhotograph, ListPhotosResponse, GetUserDailyPhotographsParams, GetDailyPhotographsByDateRangeParams } from '@/interface/photo';

const {
    // photo (legacy)
    listPhotos,
    // daily photograph
    getUserDailyPhotographs,
    getDailyPhotographsByDateRange,
    getDailyPhotograph,
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

export function useUserDailyPhotographs(params: GetUserDailyPhotographsParams) {
    const { isLoading, error, data } = useQuery({
        queryKey: ['userDailyPhotographs', params],
        queryFn: async () => {
            const res = await get<BaseResponse<ListPhotosResponse>>(`${getUserDailyPhotographs}/${params.user_id}?page=${params.page || 1}&size=${params.size || 10}`)
            if (res.code === 0) {
                return res.data as ListPhotosResponse
            }
            throw new Error(`[Get user daily photographs error] code: ${res.code} | msg: ${res.msg}`)
        }
    })
    return {
        isLoading,
        error,
        photos: data?.photos || [],
        total: data?.total || 0
    }
}

export function useDailyPhotographsByDateRange(params: GetDailyPhotographsByDateRangeParams) {
    const { isLoading, error, data } = useQuery({
        queryKey: ['dailyPhotographsByDateRange', params],
        queryFn: async () => {
            const res = await get<BaseResponse<ListPhotosResponse>>(`${getDailyPhotographsByDateRange}/${params.user_id}?start_date=${params.start_date}&end_date=${params.end_date}&page=${params.page || 1}&size=${params.size || 10}`)
            if (res.code === 0) {
                return res.data as ListPhotosResponse
            }
            throw new Error(`[Get daily photographs by date range error] code: ${res.code} | msg: ${res.msg}`)
        }
    })
    return {
        isLoading,
        error,
        photos: data?.photos || [],
        total: data?.total || 0
    }
}

export function useDailyPhotograph(photoId: string) {
    const { isLoading, error, data } = useQuery({
        queryKey: ['dailyPhotograph', photoId],
        queryFn: async () => {
            const res = await get<BaseResponse<DailyPhotograph>>(`${getDailyPhotograph}/${photoId}`)
            if (res.code === 0) {
                return res.data as DailyPhotograph
            }
            throw new Error(`[Get daily photograph error] code: ${res.code} | msg: ${res.msg}`)
        },
        enabled: !!photoId
    })
    return {
        isLoading,
        error,
        photo: data
    }
}