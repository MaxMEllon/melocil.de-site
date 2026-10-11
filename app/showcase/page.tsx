import type { Metadata } from 'next'

// showcase はトップページに統合した。静的書き出しでサーバ側のリダイレクトが
// 使えないので、共有済みの /showcase/ は meta refresh で /#showcase に飛ばす
export const metadata: Metadata = {
  title: 'showcase — melocil.de',
  alternates: { canonical: '/' },
  robots: { index: false },
}

export default function ShowcaseRedirect() {
  return (
    <main className="page">
      <meta httpEquiv="refresh" content="0; url=/#showcase" />
      <p>
        <a href="/#showcase">melocil.de の showcase へ移動しました</a>
      </p>
    </main>
  )
}
