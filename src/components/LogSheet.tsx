import { useEffect, useRef, useState } from 'react'
import type { DaySchedule } from '../types/trip'
import { drawLogSheet, type LogSheetMeta } from '../utils/canvasDrawer'

interface LogSheetProps {
  day: DaySchedule
  meta?: LogSheetMeta
}

export default function LogSheet({ day, meta }: LogSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const drivingHrs = day.events
    .filter(e => e.status === 'driving')
    .reduce((sum, e) => sum + (e.end - e.start), 0)

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      drawLogSheet(canvasRef.current, day, meta)
    }
  }, [isOpen, day, meta])

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `log-day-${day.day}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className={`log-sheet ${isOpen ? 'log-sheet--open' : ''}`}>

      {/* ── Card header / toggle ── */}
      <div className="log-sheet-header" onClick={() => setIsOpen(o => !o)}>
        <svg
          className={`log-sheet-chevron ${isOpen ? 'log-sheet-chevron--open' : ''}`}
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>

        <div className="log-sheet-header-info">
          <span className="log-sheet-date mono">{day.date}</span>
          <span className="log-sheet-miles mono">{Math.round(day.total_miles)} mi</span>
        </div>

        {drivingHrs > 0 && (
          <div className="log-sheet-driving-badge">
            <span className="log-sheet-driving-dot" />
            <span className="mono">{drivingHrs.toFixed(1)}h driving</span>
          </div>
        )}

        <div className="log-sheet-day-badge">Day {day.day}</div>
      </div>

      {/* ── Expanded body ── */}
      {isOpen && (
        <div style={{ padding: '12px' }}>
          <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
          <button onClick={handleDownload} className="download-log-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download Day {day.day} Log
          </button>
        </div>
      )}
    </div>
  )
}
