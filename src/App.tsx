import { useTripPlan } from './hooks/useTripPlan'
import TripForm from './components/TripForm'
import ResultsView from './components/ResultsView'
import './index.css'

function App() {
  const { result, loading, error, planTrip, reset } = useTripPlan()

  if (result) {
    return <ResultsView data={result} onReset={reset} />
  }

  return (
    <main className="app">
      <TripForm onSubmit={planTrip} loading={loading} error={error} />
    </main>
  )
}

export default App
