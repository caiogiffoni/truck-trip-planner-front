import { useState } from 'react'
import type { DaySchedule } from '../types/trip'
import LogSheet from './LogSheet'

interface LogSheetListProps {
  days: DaySchedule[]
}

export default function LogSheetList({ days }: LogSheetListProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="log-sheet-list">
      <div className="panel-title panel-title--toggle" onClick={() => setIsOpen(o => !o)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        ELD Daily Logs
        <span className="panel-badge">{days.length} day{days.length !== 1 ? 's' : ''}</span>
        <svg
          className={`panel-chevron ${isOpen ? 'panel-chevron--open' : ''}`}
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {isOpen && (
        <div className="log-sheet-scroll">
          {days.map(day => (
            <LogSheet key={day.day} day={day} />
          ))}
        </div>
      )}
    </div>
  )
}
