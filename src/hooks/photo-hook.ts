import { useQuery } from '@tanstack/react-query'
import { get } from '@/utils/request'
import api from '@/lib/api'
import { log } from 'console'

const {
    // updatePhotos,
    listPhotos,
} = api

export function useListPhoto() {
    const { isLoading, error, data: photoList } = useQuery({
        queryKey: ['photoList'],
        queryFn: async () => {
            const res = await get(listPhotos)
            return res
        }
    })
    return {
        isLoading,
        error,
        photoList
    }
}