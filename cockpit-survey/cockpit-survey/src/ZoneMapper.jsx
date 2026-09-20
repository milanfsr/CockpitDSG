import { useState, useEffect, useRef } from 'react'
import './ZoneMapper.css'

const WINDOW_ZONES = new Set([
  'path1','path2','path3','path4','path5','path6','path7','path8'
])

const STATES = ['none', 'physical', 'touchscreen', 'mixed']
const COLORS = {
  none:        'transparent',
  physical:    '#22c55e',
  touchscreen: '#ef4444',
  mixed:       '#3b82f6',
}
const OPACITIES = {
  none:        0.08,
  physical:    0.65,
  touchscreen: 0.65,
  mixed:       0.65,
}

function applyStyle(path, state) {
  // Use style.fill / style.fillOpacity so they override the inline style="fill:#ff0000"
  path.style.fill = COLORS[state]
  path.style.fillOpacity = OPACITIES[state]
}

export default function ZoneMapper({ systems, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [allAnswers, setAllAnswers] = useState({})
  const [selectedCount, setSelectedCount] = useState(0)
  const [attempted, setAttempted] = useState(false)

  const zoneStateRef = useRef({})
  const svgLoadedRef = useRef(false)
  const containerRef = useRef(null)

  const currentSystem = systems[currentIdx]
  const isLast = currentIdx === systems.length - 1

  // Load SVG once
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
        svg.style.display = 'block'
        svgLoadedRef.current = true
        initZones()
      })
  }, [])

  // Re-init whenever system changes
  useEffect(() => {
    if (!svgLoadedRef.current) return
    initZones()
  }, [currentIdx])

  function getZonePaths() {
    if (!containerRef.current) return []
    return Array.from(containerRef.current.querySelectorAll('path[id]'))
      .filter(p => {
        const id = p.getAttribute('id')
        return id && !WINDOW_ZONES.has(id)
      })
  }

  function initZones() {
    const saved = allAnswers[currentSystem?.id] || {}
    zoneStateRef.current = { ...saved }

    // Update counter
    setSelectedCount(Object.values(saved).filter(s => s !== 'none').length)

    getZonePaths().forEach(path => {
      const id = path.getAttribute('id')

      const state = saved[id] || 'none'
      applyStyle(path, state)
      path.style.cursor = 'pointer'
      path.style.transition = 'fill 0.12s, fill-opacity 0.12s'

      // Clone to clear any previous event listeners
      const fresh = path.cloneNode(true)
      applyStyle(fresh, state)
      fresh.style.cursor = 'pointer'
      fresh.style.transition = 'fill 0.12s, fill-opacity 0.12s'
      path.parentNode.replaceChild(fresh, path)

      fresh.addEventListener('click', () => {
        const cur = zoneStateRef.current[id] || 'none'
        const next = STATES[(STATES.indexOf(cur) + 1) % STATES.length]
        zoneStateRef.current = { ...zoneStateRef.current, [id]: next }
        applyStyle(fresh, next)
        // Update the counter in React
        const count = Object.values(zoneStateRef.current).filter(s => s !== 'none').length
        setSelectedCount(count)
      })
    })
  }

  function handleNext() {
    if (selectedCount === 0) {
      setAttempted(true)
      return
    }
    setAttempted(false)
    const updated = { ...allAnswers, [currentSystem.id]: { ...zoneStateRef.current } }
    setAllAnswers(updated)
    if (isLast) {
      onComplete(updated)
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  function handleBack() {
    const updated = { ...allAnswers, [currentSystem.id]: { ...zoneStateRef.current } }
    setAllAnswers(updated)
    setCurrentIdx(i => i - 1)
  }

  if (!currentSystem) return null

  return (
    <div className="zm-wrap">
      <div className="zm-instructions">
        <p className="zm-instructions-title">Part 2 — Zone Placement</p>
        <p className="zm-instructions-body">For each system you marked as flexible, tap the cockpit zones where you would find it acceptable to place it. Tap once for <strong>physical button</strong>, twice for <strong>touchscreen</strong>, three times for <strong>mixed / no preference</strong>, and a fourth time to deselect.</p>
      </div>
      <div className="zm-header">
        <div className="zm-progress">{currentIdx + 1} of {systems.length}</div>
        <div className="zm-system-name">{currentSystem.name}</div>
        <div className="zm-system-desc">{currentSystem.desc}</div>
      </div>

      <div className="zm-svg-area">
        <div ref={containerRef} className="zm-svg-container" />
      </div>

      <div className="zm-legend">
        <div className="zm-legend-item">
          <span className="zm-swatch" style={{ background: COLORS.physical }} />
          Physical button
        </div>
        <div className="zm-legend-item">
          <span className="zm-swatch" style={{ background: COLORS.touchscreen }} />
          Touchscreen
        </div>
        <div className="zm-legend-item">
          <span className="zm-swatch" style={{ background: COLORS.mixed }} />
          Mixed / no preference
        </div>

      </div>

      <div className="zm-footer">
        <div className="zm-footer-left">
          {currentIdx > 0 && (
            <button className="zm-btn zm-btn-back" type="button" onClick={handleBack}>
              ← Back
            </button>
          )}
        </div>
        <div className="zm-footer-center">
          <span className={attempted && selectedCount === 0 ? 'zm-hint zm-hint-error' : 'zm-hint'}>
            {attempted && selectedCount === 0
              ? 'Please select at least one zone before continuing.'
              : selectedCount > 0
                ? `${selectedCount} zone${selectedCount !== 1 ? 's' : ''} selected`
                : 'Tap zones to mark acceptable positions'}
          </span>
        </div>
        <div className="zm-footer-right">
          <button className="zm-btn zm-btn-next" type="button" onClick={handleNext}>
            {isLast ? 'Finish ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
