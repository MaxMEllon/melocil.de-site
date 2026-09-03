import { ContributionGraph } from '@/components/ContributionGraph'
import { loadAppearances, ROLE_LABELS } from '@/lib/appearances'
import { buildYearGrid, listYears } from '@/lib/heatmap'

const LEGEND = ['DJ', 'VJ', 'DJVJ'] as const

export default function Page() {
  const appearances = loadAppearances()
  const years = listYears(appearances)
  const first = appearances.at(0)
  const last = appearances.at(-1)

  return (
    <main className="page">
      <header className="page-header">
        <h1>melocil.de</h1>
        <p className="tagline">めろちだ — DJ / VJ 出演履歴</p>
        {first && last && (
          <p className="summary">
            {appearances.length} 件 ({first.date} 〜 {last.date})
          </p>
        )}
        <ul className="legend">
          {LEGEND.map((role) => (
            <li key={role}>
              <span className="swatch" data-role={role} aria-hidden="true" />
              {ROLE_LABELS[role]}
            </li>
          ))}
        </ul>
      </header>

      {years.map((year) => (
        <ContributionGraph key={year} grid={buildYearGrid(year, appearances)} />
      ))}

      <footer className="page-footer">
        <p>
          出典:{' '}
          <a href="https://lit.link/melocilde" rel="noreferrer">
            lit.link/melocilde
          </a>
        </p>
      </footer>
    </main>
  )
}
