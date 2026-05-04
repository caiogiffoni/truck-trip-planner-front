import { useEffect, useRef } from 'react'
import type { DaySchedule } from '../types/trip'
import { drawLogSheet } from '../utils/canvasDrawer'

interface LogSheetProps {
  day: DaySchedule
}

export default function LogSheet({ day }: LogSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      drawLogSheet(canvasRef.current, day)
    }
  }, [day])

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `eld-log-day-${day.day}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="log-sheet">
      <div className="log-sheet-header">
        <span className="log-sheet-day">Day {day.day}</span>
        <span className="log-sheet-date mono">{day.date}</span>
        <button className="download-btn" onClick={handleDownload} type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download PNG
        </button>
      </div>
      <div className="canvas-scroll">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
