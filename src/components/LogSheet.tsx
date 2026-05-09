import { useEffect, useRef } from 'react'
import type { DaySchedule } from '../types/trip'
import { drawLogSheet, type LogSheetMeta } from '../utils/canvasDrawer'

interface LogSheetProps {
  day: DaySchedule
  meta?: LogSheetMeta
}

export default function LogSheet({ day, meta }: LogSheetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && day) {
      drawLogSheet(canvasRef.current, day, meta)
    }
  }, [day, meta])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `log-day-${day.day}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontWeight: 500, marginBottom: 6 }}>Day {day.day} — {day.date}</p>
      <canvas ref={canvasRef} style={{ border: '1px solid #ccc', width: '100%' }} />
      <button onClick={handleDownload} style={{ marginTop: 8 }}>
        Download Day {day.day} Log
      </button>
    </div>
  )
}
