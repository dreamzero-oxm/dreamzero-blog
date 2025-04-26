import { Shell } from "lucide-react";
import LoginForm from "@/components/login-form";
import Link from "next/link";

export default function Page() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" title="home" className="flex items-center gap-2 font-medium">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md ">
                            <Shell className="size-6" />
                        </div>
                        Moity Soeoe Blog.
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block ">
                <img src="/images/loginBanner.jpeg"
                    alt="loginBanner" 
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6]"
                />
            </div>
        </div>
    )
}