import { useState } from 'react'
import TripForm, { type TripFormData } from './components/TripForm'
import ResultsView from './components/ResultsView'
import type { TripPlanResult } from './types/trip'
import { MOCK_TRIP } from './mockData'
import './index.css'

function App() {
  const [result, setResult] = useState<TripPlanResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: TripFormData) {
    setLoading(true)
    // TODO: replace with real API call
    await new Promise(r => setTimeout(r, 1200))
    console.log('Trip request:', data)
    setResult(MOCK_TRIP)
    setLoading(false)
  }

  if (result) {
    return <ResultsView data={result} onReset={() => setResult(null)} />
  }

  return (
    <main className="app">
      <TripForm onSubmit={handleSubmit} loading={loading} />
    </main>
  )
}

export default App
