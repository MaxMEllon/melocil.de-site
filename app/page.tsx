import { ContributionGraph } from '@/components/ContributionGraph'
import { loadAppearances, ROLE_LABELS } from '@/lib/appearances'
import { buildYearGrid, listYears } from '@/lib/heatmap'

const LEGEND = ['DJ', 'VJ', 'DJVJ'] as const

const LINKS = [
  { label: 'X', href: 'https://twitter.com/zyzyzy_vl' },
  { label: 'YouTube', href: 'https://www.youtube.com/@zyzyzy012' },
  { label: 'Mixcloud', href: 'https://www.mixcloud.com/melocilde/' },
  {
    label: 'VRChat',
    href: 'https://vrchat.com/home/user/usr_198bd4ec-e7b6-4ef7-a009-52325524fa68',
  },
] as const

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
        <ul className="profile-links">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="me noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

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
    </main>
  )
}
