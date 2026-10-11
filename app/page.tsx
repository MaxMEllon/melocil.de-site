import { ContributionGraph } from '@/components/ContributionGraph'
import { Showcase } from '@/components/Showcase'
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
  { label: 'SAVAGE', href: 'https://savage-vr.github.io/' },
] as const

const TOOLS = [
  { label: 'cue parser', href: '/cue-parser/' },
] as const

export default function Page() {
  const appearances = loadAppearances()
  const years = listYears(appearances)
  const first = appearances.at(0)
  const last = appearances.at(-1)

  return (
    <main>
      {/* ヘッダーの下に showcase を全幅で並べ、出演履歴は 860px の本文カラムでその後に続ける */}
      <div className="page page-intro">
        <header className="page-header">
          <h1>melocil.de</h1>
          <div className="header-links">
            <ul className="profile-links">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="me noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <ul className="profile-links tool-links">
              {TOOLS.map((tool) => (
                <li key={tool.label}>
                  <a href={tool.href}>{tool.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </header>
      </div>

      <Showcase />

      <div className="page page-history">
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

        {years.map((year) => (
          <ContributionGraph key={year} grid={buildYearGrid(year, appearances)} />
        ))}
      </div>
    </main>
  )
}
