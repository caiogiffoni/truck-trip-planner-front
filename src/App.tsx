import { useState } from 'react'
import TripForm, { type TripFormData } from './components/TripForm'
import ResultsView from './components/ResultsView'
import type { TripPlanResult, TripStop, DutyStatus } from './types/trip'
import './index.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResponse(raw: any): TripPlanResult {
  function normalizeLeg(val: string | string[]): string {
    return Array.isArray(val) ? val.join(', ') : String(val)
  }

  return {
    route: {
      total_miles: raw.route.total_miles,
      total_drive_time_hrs: raw.route.total_drive_time_hrs,
      polyline: (raw.route.polyline ?? []) as [number, number][],
      waypoints: raw.route.waypoints as [number, number][] | undefined,
      legs: raw.route.legs.map((leg: { from: string | string[]; to: string | string[]; miles: number; drive_hrs: number }) => ({
        from: normalizeLeg(leg.from),
        to: normalizeLeg(leg.to),
        miles: leg.miles,
        drive_hrs: leg.drive_hrs,
      })),
    },
    stops: raw.stops.map((stop: { type: string; location?: string; remark?: string; day: number; time?: string; time_start?: string; time_end?: string; coords?: [number, number] }) => ({
      type: stop.type as TripStop['type'],
      location: stop.location ?? stop.remark ?? '',
      remark: stop.remark,
      day: stop.day,
      time_start: stop.time_start ?? stop.time ?? '',
      time_end: stop.time_end ?? '',
      coords: stop.coords,
    })),
    days: raw.days.map((day: { day: number; date?: string; date_offset_days?: number; total_miles: number; vehicle_number?: string; carrier?: string; events: { status: string; start: number; end: number; remark?: string; miles?: number }[] }) => {
      let date = day.date ?? ''
      if (!date && day.date_offset_days !== undefined) {
        const base = new Date()
        base.setDate(base.getDate() + day.date_offset_days)
        date = base.toISOString().slice(0, 10)
      }
      return {
        day: day.day,
        date,
        total_miles: day.total_miles,
        vehicle_number: day.vehicle_number ?? 'TRK-0000',
        carrier: day.carrier ?? '',
        events: day.events.map(e => ({
          status: e.status as DutyStatus,
          start: e.start,
          end: e.end,
          remark: e.remark,
          miles: e.miles,
        })),
      }
    }),
    total_hours: raw.total_hours,
    violations: raw.violations,
  }
}

function App() {
  const [result, setResult] = useState<TripPlanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: TripFormData) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/trip/plan/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`${res.status} ${res.statusText}: ${text}`)
      }
      const raw = await res.json()
      setResult(normalizeResponse(raw))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return <ResultsView data={result} onReset={() => setResult(null)} />
  }

  return (
    <main className="app">
      <TripForm onSubmit={handleSubmit} loading={loading} error={error} />
    </main>
  )
}

export default App
