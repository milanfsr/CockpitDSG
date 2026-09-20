import { useState, useMemo } from 'react'
import { SYSTEMS } from '../systems'
import './CrossTabView.css'

const DEMO_FIELDS = [
  { id: 'status',      label: 'Professional Role' },
  { id: 'hours_total', label: 'Lifetime Flight Hours' },
  { id: 'age_group',   label: 'Age Group' },
  { id: 'cockpit_gen', label: 'Cockpit Generation' },
]

function ageGroup(age) {
  const n = Number(age)
  if (n < 25) return 'Under 25'
  if (n < 35) return '25–34'
  if (n < 45) return '35–44'
  if (n < 55) return '45–54'
  return '55+'
}

const COLORS = { flexible: '#22c55e', fixed: '#ef4444', unknown: '#f59e0b' }

export default function CrossTabView({ data }) {
  const [demoField, setDemoField] = useState('status')
  const [system, setSystem]       = useState(SYSTEMS[0].id)
  const [metric, setMetric]       = useState('flexible')

  const enriched = useMemo(() => data.map(r => ({
    ...r,
    persona: { ...r.persona, age_group: ageGroup(r.persona?.age) }
  })), [data])

  const groups = useMemo(() => {
    const g = {}
    enriched.forEach(r => {
      const key = r.persona?.[demoField] || 'Unknown'
      if (!g[key]) g[key] = []
      g[key].push(r)
    })
    return g
  }, [enriched, demoField])

  const tableData = useMemo(() => {
    return Object.entries(groups).map(([group, respondents]) => {
      const total    = respondents.filter(r => r.swipe_results?.[system] !== undefined).length
      const flexible = respondents.filter(r => r.swipe_results?.[system] === 'flexible').length
      const fixed    = respondents.filter(r => r.swipe_results?.[system] === 'fixed').length
      const unknown  = respondents.filter(r => r.swipe_results?.[system] === 'unknown').length
      return {
        group,
        n: respondents.length,
        total,
        flexible: total ? flexible/total : 0,
        fixed:    total ? fixed/total    : 0,
        unknown:  total ? unknown/total  : 0,
        flexibleN: flexible, fixedN: fixed, unknownN: unknown,
      }
    }).sort((a,b) => b[metric] - a[metric])
  }, [groups, system, metric])

  const sysName = SYSTEMS.find(s => s.id === system)?.name

  return (
    <div>
      <h2>Cross-Analysis</h2>
      <div className="card ct-controls">
        <div className="ct-control-group">
          <label>Break down by</label>
          <select value={demoField} onChange={e => setDemoField(e.target.value)}>
            {DEMO_FIELDS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        <div className="ct-control-group">
          <label>System</label>
          <select value={system} onChange={e => setSystem(e.target.value)}>
            {SYSTEMS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="ct-control-group">
          <label>Highlight</label>
          <select value={metric} onChange={e => setMetric(e.target.value)}>
            <option value="flexible">Flexible %</option>
            <option value="fixed">Fixed %</option>
            <option value="unknown">Don't know %</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3>{sysName} — by {DEMO_FIELDS.find(f=>f.id===demoField)?.label}</h3>
        <div className="ct-bars">
          {tableData.map(row => (
            <div key={row.group} className="ct-row">
              <div className="ct-row-header">
                <span className="ct-group">{row.group}</span>
                <span className="ct-n">n={row.n}</span>
              </div>
              <div className="ct-bar-wrap">
                {['flexible','fixed','unknown'].map(k => (
                  row[k] > 0 && (
                    <div key={k}
                      className="ct-bar-seg"
                      style={{width:`${row[k]*100}%`, background: COLORS[k]}}
                      title={`${k}: ${Math.round(row[k]*100)}% (${row[k+'N']})`}
                    />
                  )
                ))}
              </div>
              <span className="ct-pct" style={{color: COLORS[metric]}}>
                {Math.round(row[metric]*100)}%
              </span>
            </div>
          ))}
        </div>
        <div className="ct-legend">
          {Object.entries(COLORS).map(([k,c]) => (
            <span key={k} className="ct-legend-item">
              <span style={{background:c,width:8,height:8,borderRadius:'50%',display:'inline-block',marginRight:4}}/>
              {k.charAt(0).toUpperCase()+k.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{marginTop:'1.5rem'}}>
        <h3>Full Table</h3>
        <table className="ct-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>N</th>
              <th style={{color:'#22c55e'}}>Flexible</th>
              <th style={{color:'#ef4444'}}>Fixed</th>
              <th style={{color:'#f59e0b'}}>Don't know</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map(row => (
              <tr key={row.group}>
                <td>{row.group}</td>
                <td>{row.n}</td>
                <td style={{color:'#22c55e'}}>{Math.round(row.flexible*100)}% ({row.flexibleN})</td>
                <td style={{color:'#ef4444'}}>{Math.round(row.fixed*100)}% ({row.fixedN})</td>
                <td style={{color:'#f59e0b'}}>{Math.round(row.unknown*100)}% ({row.unknownN})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
