import type { TripStop, TripRoute, DaySchedule, DutyStatus } from '../types/trip'
import { floatToTime, duration } from '../utils/timeUtils'

interface StopsListProps {
  stops: TripStop[]
  route: TripRoute
  days: DaySchedule[]
}

const STATUS_CONFIG: Record<DutyStatus, { label: string; color: string; bg: string; icon: string }> = {
  driving:       { label: 'Driving',       color: '#00d975', bg: 'rgba(0,217,117,0.12)',    icon: '▶' },
  on_duty:       { label: 'On Duty',       color: '#ff9500', bg: 'rgba(255,149,0,0.13)',   icon: '◈' },
  off_duty:      { label: 'Off Duty',      color: '#7a90a8', bg: 'rgba(100,116,139,0.10)', icon: '◐' },
  sleeper_berth: { label: 'Sleeper Berth', color: '#42b4ff', bg: 'rgba(66,180,255,0.12)',  icon: '◑' },
}

type EventItem = {
  day: number
  start: number
  end: number
  status: DutyStatus
  remark?: string
  miles?: number
}

export default function StopsList({ route, days }: StopsListProps) {
  const drivingHours = days.reduce((total, day) =>
    total + day.events
      .filter(e => e.status === 'driving')
      .reduce((s, e) => s + (e.end - e.start), 0), 0)

  const drivingMiles = days.reduce((total, day) =>
    total + day.events
      .filter(e => e.status === 'driving')
      .reduce((s, e) => s + (e.miles ?? 0), 0), 0)

  const displayMiles = drivingMiles > 0 ? drivingMiles : route.total_miles

  // Flatten all events across all days, sorted by (day, start)
  const allEvents: EventItem[] = days
    .flatMap(day =>
      day.events.map(e => ({
        day: day.day,
        start: e.start,
        end: e.end,
        status: e.status,
        remark: e.remark,
        miles: e.miles,
      }))
    )
    .sort((a, b) => a.day !== b.day ? a.day - b.day : a.start - b.start)

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
          <span className="stat-value mono">
            {days.reduce((t, day) => t + day.events.reduce((s, e) => s + (e.end - e.start), 0), 0).toFixed(1)}
          </span>
          <span className="stat-label">total hours</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value mono">{days.length}</span>
          <span className="stat-label">days</span>
        </div>
      </div>

      <div className="stops-timeline">
        {allEvents.map((ev, i) => {
          const cfg = STATUS_CONFIG[ev.status]
          const isLast = i === allEvents.length - 1
          const prevDay = i > 0 ? allEvents[i - 1].day : null
          const isDayBreak = prevDay !== null && ev.day !== prevDay

          return (
            <div key={`${ev.day}-${ev.start}-${ev.status}-${i}`}>
              {isDayBreak && (
                <div className="day-divider">
                  <span className="day-divider-label">Day {ev.day}</span>
                </div>
              )}
              <div className="event-card" style={{ borderLeftColor: cfg.color, background: cfg.bg }}>
                <div className="event-card-top">
                  <span className="event-card-icon" style={{ color: cfg.color }}>{cfg.icon}</span>
                  <span className="event-card-badge" style={{ color: cfg.color, borderColor: cfg.color + '50' }}>
                    {cfg.label}
                  </span>
                  <span className="event-card-time mono">
                    Day {ev.day} · {floatToTime(ev.start)}–{floatToTime(ev.end)}
                  </span>
                </div>
                {ev.remark && (
                  <div className="event-card-remark">{ev.remark}</div>
                )}
                <div className="event-card-meta mono">
                  {duration(ev.start, ev.end)}
                  {ev.miles && ev.miles > 0
                    ? ` · ${ev.miles.toLocaleString(undefined, { maximumFractionDigits: 0 })} mi`
                    : ''}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
