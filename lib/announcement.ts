import type { Appearance } from '@/lib/appearances'

export const X_HANDLE = 'zyzyzy_vl'

export type AnnouncementLink = {
  href: string
  /** 'tweet' = JSON に URL がある / 'search' = タイトルからの X 検索フォールバック */
  kind: 'tweet' | 'search'
}

/**
 * 検索に効かない飾りを落とす。
 * `[VJ]` などのロールは JSON 生成時に除いてあるが、`[Live Coding]` `<Real>` の類は
 * タイトルに残っていて、そのまま投げると告知ツイートに当たらない。
 */
function searchTerms(title: string): string {
  return title
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 告知ツイートへのリンク。
 * JSON に url があればそれを、無ければ本人アカウント内の検索に落とす
 * （94件の URL を X から機械的に集められないため、埋まるまでの受け皿）。
 */
export function announcementLink(appearance: Appearance): AnnouncementLink {
  if (appearance.url) {
    return { href: appearance.url, kind: 'tweet' }
  }

  const terms = searchTerms(appearance.title) || appearance.title
  const query = `from:${X_HANDLE} ${terms}`

  return {
    href: `https://x.com/search?q=${encodeURIComponent(query)}&f=live`,
    kind: 'search',
  }
}
