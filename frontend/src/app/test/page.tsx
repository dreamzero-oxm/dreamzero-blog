'use client'

import {useCheckAndRefreshToken} from '@/hooks/auth-hook'
import { useEffect } from 'react'

export default function Page() {

    const {checkAndRefresh} = useCheckAndRefreshToken('main')
    useEffect(()=>{
        checkAndRefresh()
    }, [])

    return <div>test</div>
}