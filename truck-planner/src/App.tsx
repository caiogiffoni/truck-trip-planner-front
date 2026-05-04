import TripForm, { type TripFormData } from './components/TripForm'
import './index.css'

function App() {
  function handleSubmit(data: TripFormData) {
    // TODO: wire up to useTripPlan hook
    console.log('Trip data:', data)
  }

  return (
    <main className="app">
      <TripForm onSubmit={handleSubmit} />
    </main>
  )
}

export default App
