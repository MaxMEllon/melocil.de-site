import type { Appearance, Role } from '@/lib/appearances'

export type Cell = {
  /** YYYY-MM-DD */
  date: string
  /** 前年末 / 翌年始の埋めセルなら false */
  inYear: boolean
  events: Appearance[]
  /** 表示色を決める合成済みロール。出演が無い日は null */
  role: Role | null
}

export type MonthLabel = {
  /** 0 始まりの列インデックス */
  column: number
  label: string
}

export type YearGrid = {
  year: number
  /** 53列 × 7行。columns[i][j] の j は 0=日曜 〜 6=土曜 */
  columns: Cell[][]
  monthLabels: MonthLabel[]
  /** その年の出演（日付昇順） */
  appearances: Appearance[]
  /** セル数ではなくイベント件数 */
  counts: Record<Role, number> & { total: number }
}

const DAY_MS = 86_400_000

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// ローカルタイムを一切通さないため、通日（UTC の 1970-01-01 からの日数）で計算する。
// new Date('2026-06-20') のタイムゾーン解釈に依存すると曜日が 1 日ズレる。
function toDayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / DAY_MS
}

function toIsoDate(dayNumber: number): string {
  return new Date(dayNumber * DAY_MS).toISOString().slice(0, 10)
}

/** 0 = 日曜 */
function weekdayOf(dayNumber: number): number {
  return new Date(dayNumber * DAY_MS).getUTCDay()
}

/** DJ と VJ の両方に出ている日は、内訳が何件でも DJVJ 扱いにする */
function mergeRoles(events: Appearance[]): Role | null {
  if (events.length === 0) return null

  const hasDj = events.some((e) => e.role === 'DJ' || e.role === 'DJVJ')
  const hasVj = events.some((e) => e.role === 'VJ' || e.role === 'DJVJ')

  if (hasDj && hasVj) return 'DJVJ'
  return hasDj ? 'DJ' : 'VJ'
}

export function buildYearGrid(year: number, appearances: Appearance[]): YearGrid {
  const inYear = appearances.filter((a) => a.date.startsWith(`${year}-`))

  const byDate = new Map<string, Appearance[]>()
  for (const appearance of inYear) {
    const bucket = byDate.get(appearance.date)
    if (bucket) bucket.push(appearance)
    else byDate.set(appearance.date, [appearance])
  }

  // 1/1 の直前（含む）日曜から 12/31 の直後（含む）土曜まで = 53 列
  const firstDay = toDayNumber(`${year}-01-01`)
  const lastDay = toDayNumber(`${year}-12-31`)
  const start = firstDay - weekdayOf(firstDay)
  const end = lastDay + (6 - weekdayOf(lastDay))

  const columns: Cell[][] = []
  for (let day = start; day <= end; day += 7) {
    const column: Cell[] = []
    for (let offset = 0; offset < 7; offset += 1) {
      const date = toIsoDate(day + offset)
      const events = byDate.get(date) ?? []
      column.push({
        date,
        inYear: date.startsWith(`${year}-`),
        events,
        role: mergeRoles(events),
      })
    }
    columns.push(column)
  }

  // 各列の一番上にある「その年の日」の月が変わった列にラベルを置く
  const monthLabels: MonthLabel[] = []
  let previousMonth = -1
  columns.forEach((column, index) => {
    const first = column.find((cell) => cell.inYear)
    if (!first) return

    const month = Number(first.date.slice(5, 7))
    if (month !== previousMonth) {
      monthLabels.push({ column: index, label: MONTH_LABELS[month - 1] })
      previousMonth = month
    }
  })

  const counts = { DJ: 0, VJ: 0, DJVJ: 0, total: inYear.length }
  for (const appearance of inYear) {
    counts[appearance.role] += 1
  }

  return { year, columns, monthLabels, appearances: inYear, counts }
}

/** 出演がある年を降順で返す */
export function listYears(appearances: Appearance[]): number[] {
  const years = new Set(appearances.map((a) => Number(a.date.slice(0, 4))))
  return [...years].sort((a, b) => b - a)
}
