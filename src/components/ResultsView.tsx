import type { TripPlanResult } from '../types/trip'
import MapView from './MapView'
import LogSheetList from './LogSheetList'
import StopsList from './StopsList'

interface ResultsViewProps {
  data: TripPlanResult
  onReset: () => void
}

export default function ResultsView({ data, onReset }: ResultsViewProps) {
  return (
    <div className="results-layout">
      <header className="results-header">
        <div className="results-header-left">
          <div className="results-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <span className="results-title">ELD Trip Planner</span>
        </div>
        <div className="results-header-meta">
          <span className="mono results-stat">{data.route.total_miles.toLocaleString()} mi</span>
          <span className="mono results-stat">{data.route.total_drive_time_hrs.toFixed(1)} hrs drive</span>
          <span className="mono results-stat">{data.days.length} day{data.days.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="reset-btn" onClick={onReset} type="button">
          ← New Trip
        </button>
      </header>

      <div className="results-body">
        {/* Left: Map (60%) */}
        <div className="results-map-panel">
          <MapView data={data} />
        </div>

        {/* Right: Logs + Stops (40%) */}
        <div className="results-right-panel">
          <StopsList stops={data.stops} route={data.route} />
          <LogSheetList days={data.days} />
        </div>
      </div>
    </div>
  )
}
