import { useState, useEffect, useRef, useMemo } from 'react'
import { SYSTEMS } from '../systems'
import './HeatmapView.css'

const INTERACTION_COLORS = {
  physical:    '#22c55e',
  touchscreen: '#ef4444',
  mixed:       '#3b82f6',
}

function interpolateColor(t) {
  // 0 = transparent, 1 = bright indigo
  const r = Math.round(79  + (99  - 79)  * t)
  const g = Math.round(70  + (102 - 70)  * t)
  const b = Math.round(229 + (241 - 229) * t)
  return `rgba(${r},${g},${b},${Math.min(0.9, t * 0.85 + 0.05)})`
}

export default function HeatmapView({ data }) {
  const [selectedSystem, setSelectedSystem] = useState(SYSTEMS[0].id)
  const [selectedZone, setSelectedZone]     = useState(null)
  const containerRef = useRef(null)
  const svgLoadedRef = useRef(false)

  const system = SYSTEMS.find(s => s.id === selectedSystem)

  // Aggregate zone data for selected system
  const zoneStats = useMemo(() => {
    const counts = {}
    data.forEach(r => {
      const zones = r.zone_results?.[selectedSystem]
      if (!zones) return
      Object.entries(zones).forEach(([zoneId, interaction]) => {
        if (!counts[zoneId]) counts[zoneId] = { total: 0, physical: 0, touchscreen: 0, mixed: 0 }
        counts[zoneId].total++
        if (interaction === 'physical')    counts[zoneId].physical++
        if (interaction === 'touchscreen') counts[zoneId].touchscreen++
        if (interaction === 'mixed')       counts[zoneId].mixed++
      })
    })
    const respondents = data.filter(r => r.zone_results?.[selectedSystem]).length
    return { counts, respondents }
  }, [data, selectedSystem])

  const maxCount = Math.max(1, ...Object.values(zoneStats.counts).map(z => z.total))

  // Load and update SVG
  useEffect(() => {
    fetch('/cockpit_view.svg')
      .then(r => r.text())
      .then(text => {
        if (!containerRef.current) return
        containerRef.current.innerHTML = text
        const svg = containerRef.current.querySelector('svg')
        if (!svg) return
        svg.setAttribute('width', '100%')
        svg.setAttribute('height', '100%')
        svgLoadedRef.current = true
        applyHeatmap()
      })
  }, [])

  useEffect(() => {
    if (svgLoadedRef.current) applyHeatmap()
  }, [selectedSystem, zoneStats])

  function applyHeatmap() {
    if (!containerRef.current) return
    const paths = containerRef.current.querySelectorAll('path[id]')
    paths.forEach(path => {
      const id = path.getAttribute('id')
      const stat = zoneStats.counts[id]
      if (stat) {
        const t = stat.total / maxCount
        path.style.fill = interpolateColor(t)
        path.style.fillOpacity = '1'
        path.style.cursor = 'pointer'
        path.onclick = () => setSelectedZone(id)
      } else {
        path.style.fill = '#1a1d27'
        path.style.fillOpacity = '0.4'
        path.style.cursor = 'default'
        path.onclick = null
      }
      // Base paths (windows/outline)
      if (/^path\d+$/.test(id)) {
        path.style.fill = '#2a2d3a'
        path.style.fillOpacity = '1'
        path.style.cursor = 'default'
      }
    })
  }

  // Flexibility stats for selected system
  const flexStats = useMemo(() => {
    const total     = data.filter(r => r.swipe_results?.[selectedSystem] !== undefined).length
    const flexible  = data.filter(r => r.swipe_results?.[selectedSystem] === 'flexible').length
    const fixed     = data.filter(r => r.swipe_results?.[selectedSystem] === 'fixed').length
    const unknown   = data.filter(r => r.swipe_results?.[selectedSystem] === 'unknown').length
    return { total, flexible, fixed, unknown }
  }, [data, selectedSystem])

  const selectedZoneStat = selectedZone ? zoneStats.counts[selectedZone] : null

  return (
    <div>
      <h2>Zone Heatmap</h2>
      <div className="hm-top">
        <div className="card hm-controls">
          <label className="hm-select-label">System</label>
          <select value={selectedSystem} onChange={e => { setSelectedSystem(e.target.value); setSelectedZone(null) }}>
            {SYSTEMS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="card hm-flex-stats">
          <h3>{system?.name}</h3>
          <div className="hm-flex-bars">
            {[['flexible','#22c55e'],['fixed','#ef4444'],['unknown','#f59e0b']].map(([k,c]) => (
              <div key={k} className="hm-flex-row">
                <span className="hm-flex-label">{k.charAt(0).toUpperCase()+k.slice(1)}</span>
                <div className="hm-flex-bar-wrap">
                  <div className="hm-flex-bar" style={{
                    width: `${flexStats.total ? (flexStats[k]/flexStats.total)*100 : 0}%`,
                    background: c
                  }}/>
                </div>
                <span className="hm-flex-pct" style={{color:c}}>
                  {flexStats.total ? Math.round((flexStats[k]/flexStats.total)*100) : 0}%
                </span>
              </div>
            ))}
            <p className="hm-respondents">{zoneStats.respondents} respondent{zoneStats.respondents !== 1 ? 's' : ''} placed this system</p>
          </div>
        </div>
      </div>

      <div className="hm-main">
        <div className="card hm-svg-card">
          <div className="hm-legend">
            <span style={{fontSize:12,color:'#6b7280'}}>Low preference</span>
            <div className="hm-gradient"/>
            <span style={{fontSize:12,color:'#6b7280'}}>High preference</span>
          </div>
          <div ref={containerRef} className="hm-svg-container"/>
          <p className="hm-hint">Click a highlighted zone to see interaction breakdown</p>
        </div>

        {selectedZoneStat && (
          <div className="card hm-zone-detail">
            <h3>Zone: {selectedZone}</h3>
            <p className="hm-zone-count">{selectedZoneStat.total} selection{selectedZoneStat.total !== 1 ? 's' : ''}</p>
            <div className="hm-zone-bars">
              {Object.entries(INTERACTION_COLORS).map(([k, c]) => (
                <div key={k} className="hm-flex-row">
                  <span className="hm-flex-label" style={{color:c}}>
                    {k.charAt(0).toUpperCase()+k.slice(1)}
                  </span>
                  <div className="hm-flex-bar-wrap">
                    <div className="hm-flex-bar" style={{
                      width: `${selectedZoneStat.total ? (selectedZoneStat[k]/selectedZoneStat.total)*100 : 0}%`,
                      background: c
                    }}/>
                  </div>
                  <span className="hm-flex-pct" style={{color:c}}>
                    {selectedZoneStat.total ? Math.round((selectedZoneStat[k]/selectedZoneStat.total)*100) : 0}%
                    <span style={{fontSize:11,color:'#6b7280',marginLeft:4}}>({selectedZoneStat[k]})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
