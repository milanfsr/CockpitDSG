import { useState } from 'react'
import './DisplayQuestionnaire.css'

export const DISPLAY_IDS = new Set([
  'pfd', 'nd', 'standby_display', 'upper_ecam', 'lower_ecam', 'isis', 'fms_cdu', 'ecl'
])

const QUESTIONS = [
  {
    id: 'size',
    text: 'What display size format do you prefer for this system?',
    options: [
      { value: 'small_dedicated', label: 'Small dedicated screen', desc: 'Compact display for this system only' },
      { value: 'large_dedicated', label: 'Large dedicated screen', desc: 'Full-size display for this system only' },
      { value: 'shared_wide', label: 'Shared widescreen', desc: 'Part of a wide multi-function display panel' },
      { value: 'no_pref', label: 'No preference' },
    ]
  },
  {
    id: 'grouping',
    text: 'How should this display relate to adjacent displays?',
    options: [
      { value: 'standalone', label: 'Standalone', desc: 'Physically separated from other displays' },
      { value: 'with_flight', label: 'Combined with PFD / ND', desc: 'Merged into one primary flight display panel' },
      { value: 'with_systems', label: 'Combined with engine / systems', desc: 'Merged with ECAM/EICAS into one panel' },
      { value: 'fully_integrated', label: 'Fully integrated', desc: 'Part of a single unified cockpit display system' },
      { value: 'no_pref', label: 'No preference' },
    ]
  },
  {
    id: 'redundancy',
    text: 'What level of redundancy do you expect for this display?',
    options: [
      { value: 'single', label: 'Single screen only', desc: 'Rely on standby instruments if it fails' },
      { value: 'dedicated_backup', label: 'Dedicated backup screen', desc: 'A standby display specifically for this system' },
      { value: 'shared_backup', label: 'Shared backup screen', desc: 'One standby display covering multiple systems' },
      { value: 'no_pref', label: 'No preference' },
    ]
  }
]

export default function DisplayQuestionnaire({ systems, onComplete }) {
  const displaySystems = systems.filter(s => DISPLAY_IDS.has(s.id))

  const [currentIdx, setCurrentIdx] = useState(0)
  const [allAnswers, setAllAnswers] = useState({})
  const [answers, setAnswers] = useState({})

  if (displaySystems.length === 0) {
    onComplete({})
    return null
  }

  const current = displaySystems[currentIdx]
  const isLast = currentIdx === displaySystems.length - 1
  const allAnswered = QUESTIONS.every(q => answers[q.id])

  function pick(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  function handleNext() {
    const updated = { ...allAnswers, [current.id]: answers }
    setAllAnswers(updated)
    if (isLast) {
      onComplete(updated)
    } else {
      setCurrentIdx(i => i + 1)
      setAnswers(allAnswers[displaySystems[currentIdx + 1]?.id] || {})
    }
  }

  function handleBack() {
    const updated = { ...allAnswers, [current.id]: answers }
    setAllAnswers(updated)
    setCurrentIdx(i => i - 1)
    setAnswers(allAnswers[displaySystems[currentIdx - 1]?.id] || {})
  }

  return (
    <div className="dq-wrap">
      <div className="dq-instructions">
        <p className="dq-instructions-title">Part 3 — Display Preferences</p>
        <p className="dq-instructions-body">For each display system you marked as flexible, answer three questions about your preferences regarding screen size, how it should relate to other displays, and what level of redundancy you expect.</p>
      </div>
      <div className="dq-header">
        <div className="dq-progress">{currentIdx + 1} of {displaySystems.length}</div>
        <div className="dq-badge">Display system</div>
        <div className="dq-title">{current.name}</div>
        <div className="dq-desc">{current.desc}</div>
      </div>

      <div className="dq-body">
        {QUESTIONS.map(q => (
          <div key={q.id} className="dq-block">
            <p className="dq-question">{q.text}</p>
            <div className="dq-options">
              {q.options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`dq-option ${answers[q.id] === opt.value ? 'dq-selected' : ''}`}
                  onClick={() => pick(q.id, opt.value)}
                >
                  <span className="dq-opt-label">{opt.label}</span>
                  {opt.desc && <span className="dq-opt-desc">{opt.desc}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="dq-footer">
        <div>
          {currentIdx > 0 && (
            <button className="dq-btn dq-back" type="button" onClick={handleBack}>← Back</button>
          )}
        </div>
        <div>
          <button
            className="dq-btn dq-next"
            type="button"
            onClick={handleNext}
            disabled={!allAnswered}
          >
            {isLast ? 'Finish ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
