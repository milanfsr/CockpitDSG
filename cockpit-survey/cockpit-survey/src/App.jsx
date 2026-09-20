import { useState } from 'react'
import GDPRScreen from './GDPRScreen'
import LoginScreen from './LoginScreen'
import PersonaScreen from './PersonaScreen'
import SwipeDeck from './SwipeDeck'
import ZoneMapper from './ZoneMapper'
import DisplayQuestionnaire, { DISPLAY_IDS } from './DisplayQuestionnaire'
import { SYSTEMS } from './systems'

const PHASE_GDPR    = 'gdpr'
const PHASE_LOGIN   = 'login'
const PHASE_PERSONA = 'persona'
const PHASE_SWIPE   = 'swipe'
const PHASE_ZONE    = 'zone'
const PHASE_DISPLAY = 'display'
const PHASE_DONE    = 'done'

export default function App() {
  const [phase,          setPhase]   = useState(PHASE_GDPR)
  const [token,          setToken]   = useState(null)
  const [personaResults, setPersona] = useState({})
  const [swipeResults,   setSwipe]   = useState({})
  const [zoneResults,    setZone]    = useState({})
  const [displayResults, setDisplay] = useState({})
  const [submitError,    setSubmitError] = useState('')

  const flexibleSystems  = SYSTEMS.filter(s => swipeResults[s.id] === 'flexible')
  const flexibleControls = flexibleSystems.filter(s => !DISPLAY_IDS.has(s.id))
  const flexibleDisplays = flexibleSystems.filter(s => DISPLAY_IDS.has(s.id))

  function handleGDPR()          { setPhase(PHASE_LOGIN) }
  function handleLogin(t)        { setToken(t); setPhase(PHASE_PERSONA) }
  function handlePersona(r)      { setPersona(r); setPhase(PHASE_SWIPE) }

  function handleSwipeComplete(results) {
    setSwipe(results)
    const hasControls = SYSTEMS.some(s => results[s.id] === 'flexible' && !DISPLAY_IDS.has(s.id))
    const hasDisplays = SYSTEMS.some(s => results[s.id] === 'flexible' && DISPLAY_IDS.has(s.id))
    if (hasControls)      setPhase(PHASE_ZONE)
    else if (hasDisplays) setPhase(PHASE_DISPLAY)
    else                  submitAndFinish(results, {}, {})
  }

  function handleZoneComplete(results) {
    setZone(results)
    if (flexibleDisplays.length > 0) setPhase(PHASE_DISPLAY)
    else submitAndFinish(swipeResults, results, {})
  }

  function handleDisplayComplete(results) {
    setDisplay(results)
    submitAndFinish(swipeResults, zoneResults, results)
  }

  async function submitAndFinish(swipe, zones, displays) {
    setSubmitError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ persona: personaResults, swipe_results: swipe, zone_results: zones, display_results: displays }),
      })
      if (!res.ok) {
        const data = await res.json()
        setSubmitError(data.error || 'Submission failed.')
        return
      }
      setPhase(PHASE_DONE)
    } catch {
      setSubmitError('Could not reach the server. Please check your connection.')
    }
  }

  if (phase === PHASE_GDPR)    return <GDPRScreen onAccept={handleGDPR} />
  if (phase === PHASE_LOGIN)   return <LoginScreen onLogin={handleLogin} />
  if (phase === PHASE_PERSONA) return <PersonaScreen onComplete={handlePersona} />
  if (phase === PHASE_SWIPE)   return <SwipeDeck onComplete={handleSwipeComplete} />
  if (phase === PHASE_ZONE && flexibleControls.length > 0)
    return <ZoneMapper systems={flexibleControls} onComplete={handleZoneComplete} />
  if (phase === PHASE_DISPLAY && flexibleDisplays.length > 0)
    return <DisplayQuestionnaire systems={flexibleDisplays} onComplete={handleDisplayComplete} />

  if (submitError) return (
    <div style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Submission error</h2>
      <p style={{ fontSize: 14, color: '#ef4444', marginBottom: 24 }}>{submitError}</p>
      <p style={{ fontSize: 13, color: '#888' }}>Please inform the study organiser.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Survey complete</h2>
      <p style={{ fontSize: 14, color: '#555' }}>Thank you for participating. Your responses have been recorded.</p>
    </div>
  )
}
