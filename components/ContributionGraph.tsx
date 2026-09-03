import type { CSSProperties } from 'react'

import { announcementLink, X_HANDLE } from '@/lib/announcement'
import { ROLE_LABELS } from '@/lib/appearances'
import type { Cell, YearGrid } from '@/lib/heatmap'

// 曜日ラベルは GitHub と同じく隔行だけ出す（0 = 日曜）
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

/** 端の列はツールチップが吹き出しごと画面外へ出るので、列位置からビルド時に寄せ方を決める */
const EDGE_COLUMNS = 8

function tipAlign(column: number, columnCount: number): 'start' | 'end' | undefined {
  if (column < EDGE_COLUMNS) return 'start'
  if (column >= columnCount - EDGE_COLUMNS) return 'end'
  return undefined
}

function formatMonthDay(date: string): string {
  return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`
}

function tooltipFor(cell: Cell): string {
  return [
    formatMonthDay(cell.date),
    ...cell.events.map((event) => `${ROLE_LABELS[event.role]} — ${event.title}`),
  ].join('\n')
}

export function ContributionGraph({ grid }: { grid: YearGrid }) {
  const columnCount = grid.columns.length

  return (
    <section className="year">
      <header className="year-header">
        <h2 className="year-title">{grid.year}</h2>
        <p className="year-counts">
          <span>出演 {grid.counts.total} 件</span>
          <span className="year-count" data-role="DJ">
            DJ {grid.counts.DJ}
          </span>
          <span className="year-count" data-role="VJ">
            VJ {grid.counts.VJ}
          </span>
          <span className="year-count" data-role="DJVJ">
            DJ + VJ {grid.counts.DJVJ}
          </span>
        </p>
      </header>

      <div className="graph-frame">
        <div
          className="graph"
          style={{ '--columns': String(columnCount) } as CSSProperties}
          role="img"
          aria-label={`${grid.year}年の出演カレンダー。DJ が緑、VJ が紫、両方出演した日は緑と紫の斜め分割。合計 ${grid.counts.total} 件。`}
        >
          <div className="graph-months">
            {grid.monthLabels.map((month) => (
              <span
                key={month.column}
                className="graph-month"
                style={{ gridColumnStart: month.column + 1 }}
              >
                {month.label}
              </span>
            ))}
          </div>

          <div className="graph-weekdays" aria-hidden="true">
            {WEEKDAY_LABELS.map((label, row) => (
              <span key={row} className="graph-weekday">
                {label}
              </span>
            ))}
          </div>

          <div className="graph-cells">
            {grid.columns.map((column, columnIndex) =>
              column.map((cell) =>
                cell.role === null ? (
                  <div
                    key={cell.date}
                    className="cell"
                    data-outside={cell.inYear ? undefined : ''}
                  />
                ) : (
                  <div
                    key={cell.date}
                    className="cell"
                    data-role={cell.role}
                    data-tooltip={tooltipFor(cell)}
                    data-tip-align={tipAlign(columnIndex, columnCount)}
                  />
                ),
              ),
            )}
          </div>
        </div>
      </div>

      <details className="year-list">
        <summary>{grid.year}年の出演 {grid.counts.total} 件</summary>
        <ol>
          {grid.appearances.map((appearance) => {
            const link = announcementLink(appearance)

            return (
              <li key={`${appearance.date}-${appearance.title}`}>
                <time dateTime={appearance.date}>{appearance.date}</time>
                <span className="badge" data-role={appearance.role}>
                  {ROLE_LABELS[appearance.role]}
                </span>
                <a
                  className="event-title"
                  data-link={link.kind}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  title={
                    link.kind === 'tweet'
                      ? '告知ツイートを開く'
                      : `X で @${X_HANDLE} の告知を検索する`
                  }
                >
                  {appearance.title}
                </a>
              </li>
            )
          })}
        </ol>
      </details>
    </section>
  )
}
