import { useState, useMemo } from 'react'
import { SYSTEMS } from '../systems'
import './DisplayView.css'

const DISPLAY_IDS = new Set(['pfd','nd','standby_display','upper_ecam','lower_ecam','isis','fms_cdu','ecl'])
const DISPLAY_SYSTEMS = SYSTEMS.filter(s => DISPLAY_IDS.has(s.id))

const QUESTIONS = [
  { id: 'size',       label: 'Screen Size Format' },
  { id: 'grouping',   label: 'Display Grouping' },
  { id: 'redundancy', label: 'Redundancy Preference' },
]

const Q_COLORS = ['#4f46e5','#22c55e','#f59e0b','#ef4444','#3b82f6']

export default function DisplayView({ data }) {
  const [selectedSystem, setSelectedSystem] = useState(DISPLAY_SYSTEMS[0].id)

  const stats = useMemo(() => {
    const result = {}
    QUESTIONS.forEach(q => {
      const counts = {}
      data.forEach(r => {
        const val = r.display_results?.[selectedSystem]?.[q.id]
        if (val) counts[val] = (counts[val] || 0) + 1
      })
      const total = Object.values(counts).reduce((a,b)=>a+b,0)
      result[q.id] = Object.entries(counts)
        .map(([name, count]) => ({ name, count, pct: total ? count/total : 0 }))
        .sort((a,b)=>b.count-a.count)
    })
    return result
  }, [data, selectedSystem])

  const respondents = data.filter(r => r.display_results?.[selectedSystem]).length
  const system = DISPLAY_SYSTEMS.find(s => s.id === selectedSystem)

  return (
    <div>
      <h2>Display Preferences</h2>
      <div className="card dv-controls">
        <label style={{fontSize:13,color:'#9ca3af'}}>Display System</label>
        <select value={selectedSystem} onChange={e => setSelectedSystem(e.target.value)}>
          {DISPLAY_SYSTEMS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span className="dv-respondents">{respondents} respondent{respondents !== 1 ? 's' : ''} answered</span>
      </div>

      <div className="grid-3">
        {QUESTIONS.map(q => (
          <div key={q.id} className="card dv-q-card">
            <h3>{q.label}</h3>
            {stats[q.id]?.length > 0 ? (
              <div className="dv-bars">
                {stats[q.id].map((d, i) => (
                  <div key={d.name} className="stat-row">
                    <span className="stat-label" title={d.name}>{d.name.replace(/_/g,' ')}</span>
                    <div className="stat-bar-wrap">
                      <div className="stat-bar" style={{width:`${d.pct*100}%`, background: Q_COLORS[i % Q_COLORS.length]}}/>
                    </div>
                    <span className="stat-pct">{Math.round(d.pct*100)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dv-empty">No data for this system</p>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{marginTop:'1.5rem'}}>
        <h3>All Display Systems — Flexibility Overview</h3>
        {DISPLAY_SYSTEMS.map(sys => {
          const total    = data.filter(r => r.swipe_results?.[sys.id] !== undefined).length
          const flexible = data.filter(r => r.swipe_results?.[sys.id] === 'flexible').length
          const fixed    = data.filter(r => r.swipe_results?.[sys.id] === 'fixed').length
          const unknown  = data.filter(r => r.swipe_results?.[sys.id] === 'unknown').length
          return (
            <div key={sys.id} className="stat-row">
              <span className="stat-label">{sys.name}</span>
              <div className="stat-bar-wrap">
                {total > 0 && <>
                  <div className="stat-bar" style={{width:`${(flexible/total)*100}%`,background:'#22c55e'}}/>
                  <div className="stat-bar" style={{width:`${(fixed/total)*100}%`,background:'#ef4444'}}/>
                  <div className="stat-bar" style={{width:`${(unknown/total)*100}%`,background:'#f59e0b'}}/>
                </>}
              </div>
              <span className="stat-pct" style={{color:'#22c55e'}}>{total ? Math.round((flexible/total)*100) : 0}%</span>
            </div>
          )
        })}
        <div className="dv-legend">
          {[['#22c55e','Flexible'],['#ef4444','Fixed'],['#f59e0b','Unknown']].map(([c,l]) => (
            <span key={l} className="dv-legend-item"><span style={{background:c, width:8,height:8,borderRadius:'50%',display:'inline-block',marginRight:4}}/>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
