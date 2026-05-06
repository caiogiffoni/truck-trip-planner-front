import rawData from '../api_return.json'
import type { TripPlanResult, TripStop, DutyStatus } from './types/trip'

const BASE_DATE = new Date('2026-05-05')

function offsetDate(days: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function normalizeLeg(val: string | string[]): string {
  return Array.isArray(val) ? val.join(', ') : String(val)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const raw = rawData as any

export const MOCK_TRIP: TripPlanResult = {
  route: {
    total_miles: raw.route.total_miles,
    total_drive_time_hrs: raw.route.total_drive_time_hrs,
    polyline: raw.route.polyline as [number, number][],
    legs: raw.route.legs.map((leg: { from: string | string[]; to: string | string[]; miles: number; drive_hrs: number }) => ({
      from: normalizeLeg(leg.from),
      to: normalizeLeg(leg.to),
      miles: leg.miles,
      drive_hrs: leg.drive_hrs,
    })),
  },
  stops: raw.stops.map((stop: { type: string; remark: string; day: number; time: string }) => ({
    type: stop.type as TripStop['type'],
    location: stop.remark,
    day: stop.day,
    time: stop.time,
    // coords not provided by backend — map markers skipped for stops without coords
  })),
  days: raw.days.map((day: { day: number; date_offset_days: number; total_miles: number; events: { status: string; start: number; end: number; remark?: string; miles?: number }[] }) => ({
    day: day.day,
    date: offsetDate(day.date_offset_days),
    total_miles: day.total_miles,
    vehicle_number: 'TRK-4821',
    carrier: 'Demo Carrier LLC',
    events: day.events.map(e => ({
      status: e.status as DutyStatus,
      start: e.start,
      end: e.end,
      remark: e.remark,
      miles: e.miles,
    })),
  })),
  total_hours: raw.total_hours,
  violations: raw.violations,
}
