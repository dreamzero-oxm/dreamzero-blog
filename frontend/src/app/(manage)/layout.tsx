'use client'
import AuthProvider from "@/components/provider/auth-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider routeType="manage">
            {children}
        </AuthProvider>
    )
}