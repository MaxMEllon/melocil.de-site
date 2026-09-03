import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { ShaderBackground } from '@/components/ShaderBackground'
import './globals.css'

export const metadata: Metadata = {
  title: 'melocil.de',
  description: 'MaxMEllon の portfolio',
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
