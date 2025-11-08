import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  eslint: {
    // 在开发环境进行 ESLint 检查，在生产环境忽略 ESLint 错误
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  env: {
    PORT: '9999',
  },
  output: 'export', // 启用静态导出
};

export default nextConfig
