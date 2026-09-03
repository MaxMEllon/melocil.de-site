import raw from '@/data/appearances.json'

export const ROLES = ['DJ', 'VJ', 'DJVJ'] as const

export type Role = (typeof ROLES)[number]

export type Appearance = {
  /** YYYY-MM-DD */
  date: string
  title: string
  role: Role
}

export const ROLE_LABELS: Record<Role, string> = {
  DJ: 'DJ',
  VJ: 'VJ',
  DJVJ: 'DJ + VJ',
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function isRealDate(date: string): boolean {
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

// data/appearances.json は手で編集するので、タイポはレンダリングではなくビルドで落とす
function parseOne(value: unknown, index: number): Appearance {
  const at = `data/appearances.json[${index}]`

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${at}: オブジェクトが必要です (${JSON.stringify(value)})`)
  }

  const { date, title, role } = value as Record<string, unknown>

  if (typeof date !== 'string' || !DATE_PATTERN.test(date) || !isRealDate(date)) {
    throw new Error(`${at}.date: 実在する YYYY-MM-DD が必要です (${JSON.stringify(date)})`)
  }
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(`${at}.title: 空でない文字列が必要です (${JSON.stringify(title)})`)
  }
  if (!isRole(role)) {
    throw new Error(`${at}.role: ${ROLES.join(' | ')} のいずれかが必要です (${JSON.stringify(role)})`)
  }

  return { date, title: title.trim(), role }
}

/** JSON を検証しつつ日付昇順で返す（JSON 側の並び順には依存しない） */
export function loadAppearances(): Appearance[] {
  if (!Array.isArray(raw)) {
    throw new Error('data/appearances.json: 配列が必要です')
  }

  return raw
    .map(parseOne)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
}
