import Link from 'next/link'
import NotFoundIcon from '@/components/icons/not-found'

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-w-screen min-h-screen px-4 py-12">
      <div className="flex flex-col items-center justify-center mb-16 mx-auto">
        <NotFoundIcon />
        <h1 className="text-4xl font-bold mb-4">404 Not Found / 404 页面未找到</h1>
        <p className="text-lg mb-4 text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
          您要查找的页面不存在或已被移动。
        </p>
        <Link href="/" className="inline-block">
          <button className="px-6 py-4 bg-black text-white dark:bg-white dark:text-black text-lg rounded-md font-semibold hover:bg-black/[0.8] hover:shadow-lg transition-all cursor-pointer">
            返回首页 / Return Home
          </button>
        </Link>
      </div>
    </main>
  )
}
