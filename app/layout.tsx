import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ShaderBackground } from '@/components/ShaderBackground'
import './globals.css'

const SITE_URL = 'https://melocil.de'
const TITLE = 'melocil.de'
const DESCRIPTION = 'めろちだ の DJ / VJ 出演履歴'
const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'melocil.de — めろちだ の DJ / VJ 出演履歴',
}

export const metadata: Metadata = {
  // OGP のカードは絶対 URL でないと読まれないので、相対パスの基準を渡しておく
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    // trailingSlash: true で書き出すので、正規の URL も末尾スラッシュ付き
    url: '/',
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
    locale: 'ja_JP',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@zyzyzy_vl',
    creator: '@zyzyzy_vl',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* 背景の 2 枚。ベイルはシェーダーの輝度上限とは別に、本文の下を必ず暗く保つ保険 */}
        <ShaderBackground />
        <div className="bg-veil" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
