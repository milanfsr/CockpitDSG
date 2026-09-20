import { useState } from 'react'
import './DropZone.css'

export default function DropZone({ onDrop, error }) {
  const [over, setOver] = useState(false)

  return (
    <div className="dz-page">
      <div
        className={`dz-box ${over ? 'dz-over' : ''}`}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
      >
        <div className="dz-icon">📊</div>
        <p className="dz-title">Cockpit Survey Data Visualiser</p>
        <p className="dz-sub">Drop your <code>survey_export.json</code> file here</p>
        <p className="dz-hint">Export from the server with:<br /><code>mongoexport --db cockpitpreferences --collection responses --out survey_export.json --jsonArray</code></p>
        {error && <p className="dz-error">{error}</p>}
      </div>
    </div>
  )
}
