import type { TripStop, TripRoute } from '../types/trip'

interface StopsListProps {
  stops: TripStop[]
  route: TripRoute
}

const STOP_CONFIG = {
  start:   { label: 'Start',   color: '#22c55e', icon: '◉' },
  pickup:  { label: 'Pickup',  color: '#60a5fa', icon: '▲' },
  dropoff: { label: 'Dropoff', color: '#ef4444', icon: '◆' },
  fuel:    { label: 'Fuel',    color: '#f59e0b', icon: '⬟' },
  rest:    { label: 'Rest',    color: '#94a3b8', icon: '◐' },
}

export default function StopsList({ stops, route }: StopsListProps) {
  return (
    <div className="stops-list">
      <div className="panel-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Trip Summary
      </div>

      <div className="route-stats">
        <div className="stat">
          <span className="stat-value mono">{route.total_miles.toLocaleString()}</span>
          <span className="stat-label">total miles</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value mono">{route.total_drive_time_hrs.toFixed(1)}</span>
          <span className="stat-label">drive hours</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value mono">{route.legs.length}</span>
          <span className="stat-label">legs</span>
        </div>
      </div>

      <div className="stops-timeline">
        {stops.map((stop, i) => {
          const cfg = STOP_CONFIG[stop.type]
          return (
            <div key={i} className="stop-item">
              <div className="stop-dot-col">
                <span className="stop-dot" style={{ color: cfg.color }}>{cfg.icon}</span>
                {i < stops.length - 1 && <span className="stop-line" />}
              </div>
              <div className="stop-content">
                <div className="stop-top">
                  <span className="stop-type-badge" style={{ color: cfg.color, borderColor: cfg.color + '40' }}>
                    {cfg.label}
                  </span>
                  <span className="stop-time mono">Day {stop.day} · {stop.time}</span>
                </div>
                <span className="stop-location">{stop.location}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
