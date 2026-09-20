import { useState } from 'react'
import './LoginScreen.css'

export default function LoginScreen({ onLogin }) {
  const [id, setId]           = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id: id.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError('Invalid ID or password. Please try again.')
        setLoading(false)
        return
      }

      // Pass token up to App — stored in React state only, never in localStorage
      onLogin(data.token)
    } catch {
      setError('Could not reach the server. Please check your connection.')
      setLoading(false)
    }
  }

  return (
    <div className="ls-wrap">
      <div className="ls-card">
        <h1 className="ls-title">Cockpit Design Survey</h1>
        <p className="ls-subtitle">Enter the access credentials provided by the study organiser.</p>

        <form className="ls-form" onSubmit={handleSubmit}>
          <div className="ls-field">
            <label className="ls-label" htmlFor="survey-id">Survey ID</label>
            <input
              id="survey-id"
              className="ls-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              value={id}
              onChange={e => setId(e.target.value)}
              required
            />
          </div>

          <div className="ls-field">
            <label className="ls-label" htmlFor="survey-password">Password</label>
            <input
              id="survey-password"
              className="ls-input"
              type="password"
              autoComplete="off"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="ls-error">{error}</p>}

          <button
            className="ls-submit"
            type="submit"
            disabled={loading || !id || !password}
          >
            {loading ? 'Checking…' : 'Enter survey →'}
          </button>
        </form>
      </div>
    </div>
  )
}
