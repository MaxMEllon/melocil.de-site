import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 静的書き出し（out/ に HTML を吐く）
  output: 'export',
  // export では next/image の最適化サーバが使えない
  images: { unoptimized: true },
  // /about -> /about/index.html にして静的配信と噛み合わせる
  trailingSlash: true,
}

export default nextConfig
