'use client'

import { useEffect, useRef, useState } from 'react'

// 標準のコントロール（シークバー等）は出さず、動画全面を再生/一時停止のボタンにする。
// 停止中だけ中央に ▶ を出す。
// hero は showcase の先頭に全幅で置く 1 本。読み込んだらミュートでループ再生しておき、
// 全面のボタンは一時停止ではなく音の出し入れにする
export function ShowcaseClip({
  src,
  poster,
  hero = false,
}: {
  src: string
  poster: string
  hero?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(hero)

  useEffect(() => {
    const video = videoRef.current
    if (!hero || !video) return
    // 動きを減らす設定の人には勝手に動かさず、普通の ▶ で待つ
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // React は muted を属性として HTML に出さないので、自動再生の前にここで立てる
    video.muted = true
    void video.play().catch(() => {})
  }, [hero])

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      // 自分で押して再生するときは音ありで始める
      video.muted = false
      setMuted(false)
      void video.play()
    } else if (hero) {
      video.muted = !video.muted
      setMuted(video.muted)
    } else {
      video.pause()
    }
  }

  const label = !playing ? '再生' : hero ? (muted ? '音を出す' : '音を消す') : '一時停止'

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        playsInline
        preload={hero ? 'auto' : 'none'}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className="showcase-play"
        data-playing={playing}
        aria-label={label}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        {hero && playing && (
          <span className="showcase-mute" data-muted={muted} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              {muted ? (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.59 3L19 9.59 17.59 8.17 15.17 10.6 12.76 8.17 11.34 9.59 13.76 12l-2.42 2.41 1.42 1.42 2.41-2.42 2.42 2.42 1.41-1.42z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
              )}
            </svg>
            {muted ? 'クリックで音を出す' : ''}
          </span>
        )}
      </button>
    </>
  )
}
