import type { Metadata } from 'next'

import { ShowcaseClip } from '@/components/ShowcaseClip'

// 動画は X から落として public/showcase/<tweet id>.mp4 に置いている。
// ポスターは同名の .jpg（1 秒目のフレーム）
// 1 ツイートから複数本載せるときは file に <tweet id>-<何本目> を指定する
type Clip = { id: string; file?: string; caption: string }

const CLIPS: readonly Clip[] = [
  { id: '2108964926547239315', file: '2108964926547239315-1', caption: '#SyntheticSense' },
  { id: '2108964926547239315', file: '2108964926547239315-4', caption: '#SyntheticSense' },
  // 4 本付いたツイートの 4 本目
  { id: '2100261718899503347', caption: '#CULT_VRC' },
  { id: '2086865145930895432', caption: '#ZEN_0809' },
  { id: '2039007323805663696', caption: '' },
  // 元動画の 16 秒目から切り出している
  { id: '2035041081654747224', caption: '#rainymagic_vr' },
  // 4 本付いたツイートの 1 本目
  { id: '2055834793011814488', caption: '' },
  { id: '2033370883876860058', caption: '#syncspin1st' },
]

// DJ は YouTube のミックスを埋め込む。タイトルは埋め込み側に出るのでラベルは付けない。
// 公開日の新しい順
const MIXES = [
  'yrTBP5Cll3U', // 2026-09-01 SAVAGE LOCKED SUMMER EDITION RECALL
  'hIJpqdF64yw', // 2026-08-26 Vol.37
  'jEUl_V7wmaI', // 2025-10-06 Vol.31
  'qh__DoO6zsc', // 2025-05-20 Vol.22
  'RtLrj8bJBGk', // 2025-01-22 Vol.17
  '3ns0kCG2rrY', // 2024-06-29 Vol.10
] as const

export const metadata: Metadata = {
  title: 'showcase — melocil.de',
  description: 'めろちだ の VJ 映像と DJ ミックス',
  alternates: { canonical: '/showcase/' },
}

export default function ShowcasePage() {
  return (
    <main className="page page-wide">
      <header className="page-header">
        <h1>showcase</h1>
        <p className="tagline">
          <a href="/">melocil.de</a> — VJ / DJ
        </p>
      </header>

      <h2 className="showcase-title">
        VJ
        {/* 再生すると音量操作なしでいきなり鳴るので、見出しの横で先に知らせる */}
        <span className="volume-note">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
          </svg>
          音量注意
        </span>
      </h2>
      <ul className="showcase">
        {CLIPS.map((clip) => (
          <li key={clip.file ?? clip.id}>
            <ShowcaseClip
              src={`/showcase/${clip.file ?? clip.id}.mp4`}
              poster={`/showcase/${clip.file ?? clip.id}.jpg`}
            />
            {clip.caption && (
              <a
                className="showcase-source"
                href={`https://x.com/zyzyzy_vl/status/${clip.id}`}
                target="_blank"
                rel="noreferrer"
              >
                {clip.caption}
              </a>
            )}
          </li>
        ))}
      </ul>

      <h2 className="showcase-title">DJ</h2>
      <ul className="showcase">
        {MIXES.map((id) => (
          <li key={id}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title="YouTube"
              loading="lazy"
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </li>
        ))}
      </ul>
    </main>
  )
}
