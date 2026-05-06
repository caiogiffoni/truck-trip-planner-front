import { useEffect, useRef, useState } from 'react'
import type { DaySchedule, DutyStatus } from '../types/trip'
import { drawLogSheet } from '../utils/canvasDrawer'
import { duration } from '../utils/timeUtils'

interface LogSheetProps {
  day: DaySchedule
}

const STATUS_META: Record<DutyStatus, { label: string; color: string }> = {
  driving:       { label: 'Driving',  color: '#16a34a' },
  on_duty:       { label: 'On Duty',  color: '#d97706' },
  off_duty:      { label: 'Off Duty', color: '#475569' },
  sleeper_berth: { label: 'Sleeper',  color: '#2563eb' },
}

function computeStatusTotals(day: DaySchedule): Partial<Record<DutyStatus, number>> {
  const totals: Partial<Record<DutyStatus, number>> = {}
  for (const e of day.events) {
    totals[e.status] = (totals[e.status] ?? 0) + (e.end - e.start)
  }
  return totals
}

export default function LogSheet({ day }: LogSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const totals = computeStatusTotals(day)
  const drivingHrs  = totals['driving']       ?? 0
  const onDutyHrs   = totals['on_duty']       ?? 0
  const offDutyHrs  = (totals['off_duty'] ?? 0) + (totals['sleeper_berth'] ?? 0)

  useEffect(() => {
    if (isOpen && canvasRef.current) drawLogSheet(canvasRef.current, day)
  }, [day, isOpen])

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `eld-log-day-${day.day}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className={`log-sheet ${isOpen ? 'log-sheet--open' : ''}`}>

      {/* ── Header / toggle ── */}
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
          <span className="log-sheet-miles mono">{day.total_miles.toFixed(0)} mi</span>
        </div>

        <button className="download-btn" onClick={handleDownload} type="button">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          PNG
        </button>

        <div className="log-sheet-day-badge">Day {day.day}</div>
      </div>

      {/* ── Collapsible body ── */}
      {isOpen && (
        <>
          {/* Status chips + mini-timeline */}
          <div className="log-sheet-status-bar">
            {drivingHrs > 0 && (
              <div className="status-chip status-chip--driving">
                <span className="status-chip-dot" />
                <span className="status-chip-label">Driving</span>
                <span className="status-chip-value mono">{duration(0, drivingHrs)}</span>
              </div>
            )}
            {onDutyHrs > 0 && (
              <div className="status-chip status-chip--onduty">
                <span className="status-chip-dot" />
                <span className="status-chip-label">On Duty</span>
                <span className="status-chip-value mono">{duration(0, onDutyHrs)}</span>
              </div>
            )}
            {offDutyHrs > 0 && (
              <div className="status-chip status-chip--offduty">
                <span className="status-chip-dot" />
                <span className="status-chip-label">Off Duty</span>
                <span className="status-chip-value mono">{duration(0, offDutyHrs)}</span>
              </div>
            )}

            <div className="status-timeline">
              {day.events.map((e, i) => {
                const meta = STATUS_META[e.status]
                const left  = (e.start / 24) * 100
                const width = ((e.end - e.start) / 24) * 100
                return (
                  <div
                    key={i}
                    className="status-timeline-seg"
                    style={{ left: `${left}%`, width: `${width}%`, background: meta.color }}
                    title={`${meta.label}: ${e.start}h–${e.end}h${e.remark ? ' · ' + e.remark : ''}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Canvas */}
          <div className="canvas-scroll">
            <canvas ref={canvasRef} />
          </div>
        </>
      )}
    </div>
  )
}
