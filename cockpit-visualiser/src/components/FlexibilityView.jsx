import { useState, useMemo } from 'react'
import { SYSTEMS } from '../systems'
import './FlexibilityView.css'

const COLORS = { flexible: '#22c55e', fixed: '#ef4444', unknown: '#f59e0b' }

export default function FlexibilityView({ data }) {
  const [sort, setSort] = useState('flexible')
  const [search, setSearch] = useState('')

  const stats = useMemo(() => {
    return SYSTEMS.map(sys => {
      const total = data.filter(r => r.swipe_results?.[sys.id] !== undefined).length
      const flexible = data.filter(r => r.swipe_results?.[sys.id] === 'flexible').length
      const fixed    = data.filter(r => r.swipe_results?.[sys.id] === 'fixed').length
      const unknown  = data.filter(r => r.swipe_results?.[sys.id] === 'unknown').length
      return {
        ...sys,
        total,
        flexible: total ? flexible / total : 0,
        fixed:    total ? fixed    / total : 0,
        unknown:  total ? unknown  / total : 0,
        flexibleN: flexible, fixedN: fixed, unknownN: unknown,
      }
    })
  }, [data])

  const filtered = stats
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sort] - a[sort])

  return (
    <div>
      <h2>System Flexibility</h2>
      <div className="flex-controls card">
        <input
          placeholder="Search systems…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
        <div className="flex-sort">
          Sort by:
          {['flexible', 'fixed', 'unknown'].map(k => (
            <button
              key={k}
              className={`flex-sort-btn ${sort === k ? 'active' : ''}`}
              style={{ '--color': COLORS[k] }}
              onClick={() => setSort(k)}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex-legend">
          {Object.entries(COLORS).map(([k, c]) => (
            <span key={k} className="flex-legend-item">
              <span className="flex-dot" style={{ background: c }} />
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </span>
          ))}
        </div>
        <div className="flex-list">
          {filtered.map(s => (
            <div key={s.id} className="flex-row">
              <span className="flex-label" title={s.name}>{s.name}</span>
              <div className="flex-bar-wrap">
                {['flexible', 'fixed', 'unknown'].map(k => (
                  s[k] > 0 && (
                    <div
                      key={k}
                      className="flex-bar-seg"
                      style={{ width: `${s[k] * 100}%`, background: COLORS[k] }}
                      title={`${k}: ${Math.round(s[k]*100)}% (${s[k+'N']})`}
                    />
                  )
                ))}
              </div>
              <span className="flex-pct" style={{ color: COLORS[sort] }}>
                {Math.round(s[sort] * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
