'use client'

import {
    QueryClient,
    QueryClientProvider
  } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false
        }
    }
})

interface QueryProviderProps {
    children: React.ReactNode
}

export default function ReactQueryProvider({children}: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient} >
            {children}
            <ReactQueryDevtools initialIsOpen={false} /> 
        </QueryClientProvider>
    )
}