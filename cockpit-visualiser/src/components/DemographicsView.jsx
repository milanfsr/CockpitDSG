import { useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './DemographicsView.css'

const PALETTE = ['#4f46e5','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#a855f7']

function countField(data, field) {
  const counts = {}
  data.forEach(r => {
    const val = r.persona?.[field]
    if (val) counts[val] = (counts[val] || 0) + 1
  })
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

function MiniPie({ data, title }) {
  return (
    <div className="card dem-pie-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({name, percent}) => `${Math.round(percent*100)}%`} labelLine={false} fontSize={11}>
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [v, n]} contentStyle={{background:'#1a1d27',border:'1px solid #2a2d3a',borderRadius:8,fontSize:12}} />
        </PieChart>
      </ResponsiveContainer>
      <div className="dem-pie-legend">
        {data.map((d, i) => (
          <div key={i} className="dem-pie-legend-item">
            <span className="dem-pie-dot" style={{background: PALETTE[i % PALETTE.length]}}/>
            <span>{d.name}</span>
            <span className="dem-pie-n">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HBar({ data, title, color = '#4f46e5' }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="card">
      <h3>{title}</h3>
      {data.map((d, i) => (
        <div key={i} className="stat-row">
          <span className="stat-label">{d.name}</span>
          <div className="stat-bar-wrap">
            <div className="stat-bar" style={{width:`${(d.value/max)*100}%`, background: color}}/>
          </div>
          <span className="stat-pct">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DemographicsView({ data }) {
  const status       = useMemo(() => countField(data, 'status'),      [data])
  const gender       = useMemo(() => countField(data, 'gender'),      [data])
  const hours        = useMemo(() => countField(data, 'hours_total'), [data])
  const hoursRecent  = useMemo(() => countField(data, 'hours_recent'),[data])
  const cockpitGen   = useMemo(() => countField(data, 'cockpit_gen'), [data])

  const licences = useMemo(() => {
    const counts = {}
    data.forEach(r => {
      (r.persona?.licences || []).forEach(l => { counts[l] = (counts[l]||0)+1 })
    })
    return Object.entries(counts).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)
  }, [data])

  const aircraft = useMemo(() => {
    const counts = {}
    data.forEach(r => {
      (r.persona?.aircraft_types || []).forEach(a => { counts[a] = (counts[a]||0)+1 })
    })
    return Object.entries(counts).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)
  }, [data])

  const ages = useMemo(() => {
    const vals = data.map(r => Number(r.persona?.age)).filter(Boolean)
    if (!vals.length) return null
    const avg = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    return { avg, min, max, n: vals.length }
  }, [data])

  return (
    <div>
      <h2>Demographics</h2>

      {ages && (
        <div className="card dem-age-card">
          <h3>Age</h3>
          <div className="dem-age-stats">
            <div className="dem-age-stat"><span className="dem-age-val">{ages.avg}</span><span className="dem-age-label">Average</span></div>
            <div className="dem-age-stat"><span className="dem-age-val">{ages.min}</span><span className="dem-age-label">Youngest</span></div>
            <div className="dem-age-stat"><span className="dem-age-val">{ages.max}</span><span className="dem-age-label">Oldest</span></div>
            <div className="dem-age-stat"><span className="dem-age-val">{ages.n}</span><span className="dem-age-label">Answered</span></div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <MiniPie data={status} title="Professional Role" />
        <MiniPie data={gender} title="Gender" />
      </div>

      <div className="grid-2" style={{marginTop:'1.5rem'}}>
        <HBar data={hours}       title="Lifetime Flight Hours"       color="#4f46e5" />
        <HBar data={hoursRecent} title="Flight Hours (Last 12 Months)" color="#22c55e" />
      </div>

      <div className="grid-2" style={{marginTop:'1.5rem'}}>
        <HBar data={licences} title="Licences Held"   color="#f59e0b" />
        <HBar data={aircraft} title="Aircraft Types"  color="#3b82f6" />
      </div>

      <div style={{marginTop:'1.5rem'}}>
        <HBar data={cockpitGen} title="Most Familiar Cockpit Generation" color="#ec4899" />
      </div>
    </div>
  )
}
