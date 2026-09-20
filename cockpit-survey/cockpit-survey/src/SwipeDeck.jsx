import { useState, useRef, useEffect } from 'react'
import './SwipeDeck.css'
import { SYSTEMS } from './systems'

export default function SwipeDeck({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState({})
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const cardRef = useRef(null)

  const fixedCount    = Object.values(results).filter(v => v === 'fixed').length
  const flexibleCount = Object.values(results).filter(v => v === 'flexible').length
  const unknownCount  = Object.values(results).filter(v => v === 'unknown').length
  const done = currentIndex >= SYSTEMS.length

  function recordAndAdvance(value) {
    const system = SYSTEMS[currentIndex]
    const next = { ...results, [system.id]: value }
    setResults(next)
    setDragX(0)
    setCurrentIndex(i => i + 1)
    if (currentIndex + 1 >= SYSTEMS.length) {
      onComplete?.(next)
    }
  }

  // Keyboard support
  useEffect(() => {
    function onKey(e) {
      if (done) return
      if (e.key === 'ArrowLeft')                       recordAndAdvance('fixed')
      if (e.key === 'ArrowRight')                      recordAndAdvance('flexible')
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        recordAndAdvance('unknown')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, done])

  // Drag handlers
  function onPointerDown(e) {
    setIsDragging(true)
    startXRef.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    cardRef.current?.setPointerCapture?.(e.pointerId)
  }

  function onPointerMove(e) {
    if (!isDragging) return
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    setDragX(x - startXRef.current)
  }

  function onPointerUp() {
    if (!isDragging) return
    setIsDragging(false)
    if (dragX > 80)       recordAndAdvance('flexible')
    else if (dragX < -80) recordAndAdvance('fixed')
    else                  setDragX(0)
  }

  if (done) {
    return (
      <div className="swipe-wrap">
        <div className="swipe-done">
          <p className="swipe-done-title">Part 1 complete</p>
          <p className="swipe-done-sub">{fixedCount} fixed · {flexibleCount} flexible · {unknownCount} unsure</p>
        </div>
      </div>
    )
  }

  const system = SYSTEMS[currentIndex]
  const rotation = dragX / 18
  const opacity = Math.max(0.6, 1 - Math.abs(dragX) / 400)
  const swipeHint = dragX > 40 ? 'flexible' : dragX < -40 ? 'fixed' : null

  return (
    <div className="swipe-wrap">
      <div className="swipe-instructions">
        <p className="swipe-instructions-title">Part 1 — System Flexibility</p>
        <p className="swipe-instructions-body">
          For each cockpit system, indicate whether its position is <strong>fixed</strong> (standardised across aircraft)
          or <strong>flexible</strong> (varies between designs).
          Swipe, use the buttons, or keyboard arrow keys. Press <strong>Don't know</strong> or Space to skip.
        </p>
      </div>

      <div className="swipe-header">
        <span>{currentIndex + 1} of {SYSTEMS.length}</span>
        <span>{fixedCount} fixed · {flexibleCount} flexible · {unknownCount} unsure</span>
      </div>

      <div className="swipe-side-labels">
        <span className="swipe-label-fixed">← Fixed</span>
        <span className="swipe-label-flexible">Flexible →</span>
      </div>

      <div className="swipe-stack">
        {/* Next card peek (static, behind) */}
        {currentIndex + 1 < SYSTEMS.length && (
          <div className="swipe-card swipe-card-peek">
            <p className="swipe-card-title">{SYSTEMS[currentIndex + 1].name}</p>
            <p className="swipe-card-desc">{SYSTEMS[currentIndex + 1].desc}</p>
          </div>
        )}

        {/* Current card */}
        <div
          ref={cardRef}
          className="swipe-card swipe-card-top"
          style={{
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            opacity,
            borderColor: swipeHint === 'flexible' ? '#22c55e' : swipeHint === 'fixed' ? '#ef4444' : undefined,
            transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={e => { startXRef.current = e.touches[0].clientX; setIsDragging(true) }}
          onTouchMove={e => { if (isDragging) setDragX(e.touches[0].clientX - startXRef.current) }}
          onTouchEnd={onPointerUp}
        >
          {swipeHint && (
            <div className={`swipe-hint-badge ${swipeHint === 'flexible' ? 'swipe-hint-flexible' : 'swipe-hint-fixed'}`}>
              {swipeHint === 'flexible' ? 'Flexible →' : '← Fixed'}
            </div>
          )}
          <p className="swipe-card-title">{system.name}</p>
          <p className="swipe-card-desc">{system.desc}</p>
        </div>
      </div>

      <div className="swipe-buttons">
        <button type="button" className="swipe-btn swipe-btn-fixed"    onClick={() => recordAndAdvance('fixed')}>← Fixed</button>
        <button type="button" className="swipe-btn swipe-btn-skip"     onClick={() => recordAndAdvance('unknown')}>Don't know</button>
        <button type="button" className="swipe-btn swipe-btn-flexible" onClick={() => recordAndAdvance('flexible')}>Flexible →</button>
      </div>

      <p className="swipe-keyboard-hint">Keyboard: ← Fixed · → Flexible · Space = Don't know</p>
    </div>
  )
}
