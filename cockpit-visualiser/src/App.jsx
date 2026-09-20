import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import DropZone from './components/DropZone'
import FlexibilityView from './components/FlexibilityView'
import HeatmapView from './components/HeatmapView'
import DemographicsView from './components/DemographicsView'
import FamiliarityView from './components/FamiliarityView'
import DisplayView from './components/DisplayView'
import CrossTabView from './components/CrossTabView'
import './App.css'

const VIEWS = [
  { id: 'flexibility',   label: 'System Flexibility' },
  { id: 'heatmap',       label: 'Zone Heatmap' },
  { id: 'demographics',  label: 'Demographics' },
  { id: 'familiarity',   label: 'Cockpit Familiarity' },
  { id: 'display',       label: 'Display Preferences' },
  { id: 'crosstab',      label: 'Cross-Analysis' },
]

export default function App() {
  const [data, setData]       = useState(null)
  const [view, setView]       = useState('flexibility')
  const [error, setError]     = useState('')

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setError('')
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith('.json')) {
      setError('Please drop a .json file exported from MongoDB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const arr = Array.isArray(parsed) ? parsed : [parsed]
        setData(arr)
      } catch {
        setError('Could not parse JSON file. Make sure it was exported with --jsonArray.')
      }
    }
    reader.readAsText(file)
  }, [])

  if (!data) return <DropZone onDrop={handleDrop} error={error} />

  const viewProps = { data }

  return (
    <div className="app-layout">
      <Sidebar views={VIEWS} active={view} onChange={setView} total={data.length} />
      <main className="app-main">
        {view === 'flexibility'  && <FlexibilityView  {...viewProps} />}
        {view === 'heatmap'      && <HeatmapView      {...viewProps} />}
        {view === 'demographics' && <DemographicsView {...viewProps} />}
        {view === 'familiarity'  && <FamiliarityView  {...viewProps} />}
        {view === 'display'      && <DisplayView      {...viewProps} />}
        {view === 'crosstab'     && <CrossTabView     {...viewProps} />}
      </main>
    </div>
  )
}
