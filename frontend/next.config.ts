import type { NextConfig } from "next";
import createMDX from '@next/mdx'
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
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
};

const withMDX = createMDX({
})

export default withContentCollections(withMDX({
  ...nextConfig,
  env: {
    PORT: '9999',
  }
}));
