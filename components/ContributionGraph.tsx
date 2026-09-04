import type { CSSProperties } from 'react'

import { ROLE_LABELS } from '@/lib/appearances'
import type { Cell, YearGrid } from '@/lib/heatmap'

// 曜日ラベルは GitHub と同じく隔行だけ出す（0 = 日曜）
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

/** 端の列はツールチップが吹き出しごと画面外へ出るので、列位置からビルド時に寄せ方を決める */
const EDGE_COLUMNS = 12

/**
 * クリックで吹き出しを固定するためだけに置くフォーカス（出す側は CSS の :focus）。
 * -1 にするとクリックでしかフォーカスが入らないので、タブ順は 1 つも増えず、
 * 読み上げから外れている role="img" の中にタブストップを作らずに済む。
 */
const PIN_TAB_INDEX = -1

function tipAlign(column: number, columnCount: number): 'start' | 'end' | undefined {
  if (column < EDGE_COLUMNS) return 'start'
  if (column >= columnCount - EDGE_COLUMNS) return 'end'
  return undefined
}

function formatMonthDay(date: string): string {
  return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`
}

/**
 * ホバーで出るフライヤー。中身は下の出演リストと同じなので、読み上げからは外す。
 * .tip は display:none から始めるので、ホバーするまで img は読み込まれない。
 */
function CellTip({ cell }: { cell: Cell }) {
  return (
    <span className="tip" aria-hidden="true">
      {cell.events.map((event) => (
        <span className="tip-event" key={`${event.date}-${event.title}`}>
          {/* 告知に画像が無い回は空箱を出さず、文字だけの小さな吹き出しにする */}
          {event.flyer && (
            <img
              className="tip-flyer"
              src={`/flyers/${event.flyer}`}
              alt=""
              loading="lazy"
              decoding="async"
            />
          )}
          <span className="tip-caption">
            {formatMonthDay(cell.date)} · {ROLE_LABELS[event.role]}
            <br />
            {event.title}
          </span>
        </span>
      ))}
    </span>
  )
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
                    data-real={cell.real ? '' : undefined}
                    data-tip-align={tipAlign(columnIndex, columnCount)}
                    tabIndex={PIN_TAB_INDEX}
                  >
                    <CellTip cell={cell} />
                  </div>
                ),
              ),
            )}
          </div>
        </div>
      </div>

      <details className="year-list">
        <summary>{grid.year}年の出演 {grid.counts.total} 件</summary>
        <ol>
          {grid.appearances.map((appearance) => (
            <li key={`${appearance.date}-${appearance.title}`}>
              <time dateTime={appearance.date}>{appearance.date}</time>
              <span className="badge" data-role={appearance.role}>
                {ROLE_LABELS[appearance.role]}
              </span>
              {appearance.url ? (
                <a
                  className="event-title"
                  href={appearance.url}
                  target="_blank"
                  rel="noreferrer"
                  title="告知ツイートを開く"
                >
                  {appearance.title}
                </a>
              ) : (
                <span className="event-title">{appearance.title}</span>
              )}
            </li>
          ))}
        </ol>
      </details>
    </section>
  )
}
