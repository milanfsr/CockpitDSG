import { useMemo } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import './FamiliarityView.css'

const GENS = [
  'Analogue / steam gauges',
  'Early glass cockpit (EFIS)',
  'Modern glass cockpit (A320 / B737 NG era)',
  'Latest generation (A220, A350, B787, etc.)',
]

const STATUS_COLORS = {
  'Student pilot': '#4f46e5',
  'Private pilot': '#22c55e',
  'Commercial pilot (CPL)': '#f59e0b',
  'Airline pilot (ATPL/MPL)': '#ef4444',
  'Flight instructor': '#3b82f6',
  'Aviation student (non-flying)': '#ec4899',
  'Other': '#9ca3af',
}

const SHORT_GEN = {
  'Analogue / steam gauges': 'Analogue',
  'Early glass cockpit (EFIS)': 'Early Glass',
  'Modern glass cockpit (A320 / B737 NG era)': 'Modern Glass',
  'Latest generation (A220, A350, B787, etc.)': 'Latest Gen',
}

export default function FamiliarityView({ data }) {
  // Overall average per generation
  const overallData = useMemo(() => {
    return GENS.map(gen => {
      const vals = data
        .map(r => r.persona?.cockpit_familiarity?.[gen])
        .filter(v => v !== undefined && v !== null)
      const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0
      return { gen: SHORT_GEN[gen], avg: +avg.toFixed(2), fullName: gen }
    })
  }, [data])

  // Per status group
  const byStatus = useMemo(() => {
    const groups = {}
    data.forEach(r => {
      const status = r.persona?.status || 'Other'
      if (!groups[status]) groups[status] = []
      groups[status].push(r)
    })
    return groups
  }, [data])

  const radarData = useMemo(() => {
    return GENS.map(gen => {
      const point = { gen: SHORT_GEN[gen] }
      Object.entries(byStatus).forEach(([status, respondents]) => {
        const vals = respondents
          .map(r => r.persona?.cockpit_familiarity?.[gen])
          .filter(v => v !== undefined && v !== null)
        point[status] = vals.length ? +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2) : 0
      })
      return point
    })
  }, [byStatus])

  const statuses = Object.keys(byStatus)

  return (
    <div>
      <h2>Cockpit Familiarity</h2>

      <div className="grid-2">
        <div className="card">
          <h3>Overall Average Familiarity (0–5)</h3>
          {overallData.map(d => (
            <div key={d.gen} className="stat-row">
              <span className="stat-label">{d.fullName}</span>
              <div className="stat-bar-wrap">
                <div className="stat-bar" style={{width:`${(d.avg/5)*100}%`, background:'#4f46e5'}}/>
              </div>
              <span className="stat-pct">{d.avg}/5</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>By Professional Role</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2d3a" />
              <PolarAngleAxis dataKey="gen" tick={{fill:'#9ca3af', fontSize:12}} />
              <PolarRadiusAxis angle={30} domain={[0,5]} tick={{fill:'#6b7280', fontSize:10}} />
              {statuses.map((s, i) => (
                <Radar
                  key={s}
                  name={s}
                  dataKey={s}
                  stroke={STATUS_COLORS[s] || '#9ca3af'}
                  fill={STATUS_COLORS[s] || '#9ca3af'}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Tooltip contentStyle={{background:'#1a1d27',border:'1px solid #2a2d3a',borderRadius:8,fontSize:12}} />
              <Legend wrapperStyle={{fontSize:11}} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card fam-table-card" style={{marginTop:'1.5rem'}}>
        <h3>Familiarity Breakdown per Role</h3>
        <table className="fam-table">
          <thead>
            <tr>
              <th>Role</th>
              {GENS.map(g => <th key={g}>{SHORT_GEN[g]}</th>)}
              <th>N</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map(status => (
              <tr key={status}>
                <td style={{color: STATUS_COLORS[status] || '#9ca3af'}}>{status}</td>
                {GENS.map(gen => {
                  const vals = byStatus[status]
                    .map(r => r.persona?.cockpit_familiarity?.[gen])
                    .filter(v => v !== undefined)
                  const avg = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '–'
                  return <td key={gen}>{avg}</td>
                })}
                <td>{byStatus[status].length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
