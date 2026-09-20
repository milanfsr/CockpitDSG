import { useState } from 'react'
import './PersonaScreen.css'

const COCKPIT_GENS = [
  'Analogue / steam gauges',
  'Early glass cockpit (EFIS)',
  'Modern glass cockpit (A320 / B737 NG era)',
  'Latest generation (A220, A350, B787, etc.)',
]

export default function PersonaScreen({ onComplete }) {
  const [answers, setAnswers] = useState({
    cockpit_familiarity: { },
  })
  const [attempted, setAttempted] = useState(false)

  function set(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function toggleMulti(id, value) {
    setAnswers(prev => {
      const cur = prev[id] || []
      return { ...prev, [id]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] }
    })
  }

  function setFamiliarity(gen, value) {
    setAnswers(prev => ({
      ...prev,
      cockpit_familiarity: { ...prev.cockpit_familiarity, [gen]: Number(value) }
    }))
  }

  function isValid() {
    return (
      answers.age && String(answers.age).trim() !== '' &&
      Number(answers.age) >= 18 &&
      answers.gender &&
      answers.status &&
      answers.hours_total &&
      answers.aircraft_types?.length > 0
    )
  }

  function handleSubmit() {
    setAttempted(true)
    if (!isValid()) return
    onComplete(answers)
  }

  const showErr = (id) => attempted && !answers[id]

  return (
    <div className="ps-wrap">
      <div className="ps-header">
        <h1 className="ps-title">About You</h1>
        <p className="ps-subtitle">Please answer a few questions about yourself before starting the survey.</p>
      </div>

      <div className="ps-questions">

        {/* ── Age ── */}
        <div className={`ps-block ${attempted && (!answers.age || Number(answers.age) < 18) ? 'ps-block-error' : ''}`}>
          <p className="ps-question">Age <span className="ps-required">*</span></p>
          <input
            className="ps-input-number"
            type="number"
            min="18"
            max="99"
            placeholder="Enter your age"
            value={answers.age || ''}
            onChange={e => set('age', e.target.value)}
          />
          {attempted && (!answers.age || Number(answers.age) < 18) && (
            <p className="ps-error-msg">{!answers.age || answers.age === '' ? 'Please enter your age.' : 'Participants must be at least 18 years old.'}</p>
          )}
        </div>

        {/* ── Gender ── */}
        <div className={`ps-block ${showErr('gender') ? 'ps-block-error' : ''}`}>
          <p className="ps-question">Gender <span className="ps-required">*</span></p>
          <p className="ps-hint">Collected for anthropometric analysis only</p>
          <div className="ps-options">
            {['Man', 'Woman', 'Non-binary', 'Prefer not to say'].map(opt => (
              <button key={opt} type="button"
                className={`ps-option ${answers.gender === opt ? 'ps-selected' : ''}`}
                onClick={() => set('gender', opt)}>
                <span className="ps-radio" />{opt}
              </button>
            ))}
          </div>
          {showErr('gender') && <p className="ps-error-msg">Please select an option.</p>}
        </div>

        {/* ── Status ── */}
        <div className={`ps-block ${showErr('status') ? 'ps-block-error' : ''}`}>
          <p className="ps-question">Current role <span className="ps-required">*</span></p>
          <div className="ps-options">
            {['Student pilot','Private pilot','Commercial pilot (CPL)','Airline pilot (ATPL/MPL)','Flight instructor','Aviation student (non-flying)','Other'].map(opt => (
              <button key={opt} type="button"
                className={`ps-option ${answers.status === opt ? 'ps-selected' : ''}`}
                onClick={() => set('status', opt)}>
                <span className="ps-radio" />{opt}
              </button>
            ))}
          </div>
          {showErr('status') && <p className="ps-error-msg">Please select your role.</p>}
        </div>

        {/* ── Licences ── */}
        <div className="ps-block">
          <p className="ps-question">Licences held</p>
          <p className="ps-hint">Select all that apply — optional</p>
          <div className="ps-options">
            {['None / student','LAPL','PPL(A)','PPL(H)','CPL','MPL','ATPL','Military equivalent'].map(opt => {
              const sel = (answers.licences || []).includes(opt)
              return (
                <button key={opt} type="button"
                  className={`ps-option ${sel ? 'ps-selected' : ''}`}
                  onClick={() => toggleMulti('licences', opt)}>
                  <span className={`ps-checkbox ${sel ? 'ps-checkbox-checked' : ''}`} />{opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Flight hours total ── */}
        <div className={`ps-block ${showErr('hours_total') ? 'ps-block-error' : ''}`}>
          <p className="ps-question">Total lifetime flight hours <span className="ps-required">*</span></p>
          <div className="ps-options">
            {['0–50 h','50–200 h','200–500 h','500–1 500 h','1 500–5 000 h','5 000+ h'].map(opt => (
              <button key={opt} type="button"
                className={`ps-option ${answers.hours_total === opt ? 'ps-selected' : ''}`}
                onClick={() => set('hours_total', opt)}>
                <span className="ps-radio" />{opt}
              </button>
            ))}
          </div>
          {showErr('hours_total') && <p className="ps-error-msg">Please select your flight hours.</p>}
        </div>

        {/* ── Flight hours last 12 months ── */}
        <div className="ps-block">
          <p className="ps-question">Flight hours in the last 12 months</p>
          <p className="ps-hint">Optional</p>
          <div className="ps-options">
            {['0 h','1–20 h','20–100 h','100–300 h','300–1 000 h','1 000+ h'].map(opt => (
              <button key={opt} type="button"
                className={`ps-option ${answers.hours_recent === opt ? 'ps-selected' : ''}`}
                onClick={() => set('hours_recent', opt)}>
                <span className="ps-radio" />{opt}
              </button>
            ))}
          </div>
        </div>

        {/* ── Aircraft types ── */}
        <div className={`ps-block ${attempted && !answers.aircraft_types?.length ? 'ps-block-error' : ''}`}>
          <p className="ps-question">Aircraft types flown <span className="ps-required">*</span></p>
          <p className="ps-hint">Select all that apply</p>
          <div className="ps-options">
            {['Single-engine piston','Multi-engine piston','Turboprop','Business jet','Narrow-body airliner (A320 / B737 family)','Wide-body airliner','Helicopter','Military'].map(opt => {
              const sel = (answers.aircraft_types || []).includes(opt)
              return (
                <button key={opt} type="button"
                  className={`ps-option ${sel ? 'ps-selected' : ''}`}
                  onClick={() => toggleMulti('aircraft_types', opt)}>
                  <span className={`ps-checkbox ${sel ? 'ps-checkbox-checked' : ''}`} />{opt}
                </button>
              )
            })}
          </div>
          {attempted && !answers.aircraft_types?.length && (
            <p className="ps-error-msg">Please select at least one aircraft type.</p>
          )}
        </div>

        {/* ── Cockpit familiarity sliders ── */}
        <div className="ps-block">
          <p className="ps-question">Cockpit familiarity</p>
          <p className="ps-hint">Rate your familiarity with each cockpit generation — optional</p>
          <div className="ps-sliders">
            {COCKPIT_GENS.map(gen => {
              const val = answers.cockpit_familiarity?.[gen] ?? 0
              return (
                <div key={gen} className="ps-slider-row">
                  <span className="ps-slider-label">{gen}</span>
                  <div className="ps-slider-wrap">
                    <span className="ps-slider-min">Not familiar</span>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={val}
                      onChange={e => setFamiliarity(gen, e.target.value)}
                      className="ps-slider"
                    />
                    <span className="ps-slider-max">Highly familiar</span>
                  </div>
                  <span className="ps-slider-value">{val} / 5</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      <div className="ps-footer">
        <button type="button" className="ps-submit" onClick={handleSubmit}>
          Continue →
        </button>
        {attempted && !isValid() && (
          <p className="ps-footer-error">Please answer all required questions (marked *).</p>
        )}
      </div>
    </div>
  )
}
