export type DutyStatus = 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty'
export type StopType = 'start' | 'pickup' | 'dropoff' | 'fuel' | 'rest' | 'break'

export interface DutyEvent {
  status: DutyStatus
  start: number   // float hours, 0–24
  end: number
  remark?: string
  miles?: number
}

export interface DaySchedule {
  day: number
  date: string          // YYYY-MM-DD
  total_miles: number
  vehicle_number?: string
  carrier?: string
  events: DutyEvent[]
}

export interface RouteLeg {
  from: string
  to: string
  miles: number
  drive_hrs: number
}

export interface TripStop {
  type: StopType
  location: string      // human-readable city name
  remark?: string       // full description from backend
  coords?: [number, number]  // [lng, lat] — optional, not always provided by backend
  day: number
  time_start: string    // HH:MM
  time_end: string      // HH:MM or empty string
}

export interface TripRoute {
  total_miles: number
  total_drive_time_hrs: number
  polyline: [number, number][]  // [lng, lat]
  waypoints?: [number, number][]  // [lng, lat] – [start, pickup, dropoff]
  legs: RouteLeg[]
}

export interface TripPlanResult {
  route: TripRoute
  stops: TripStop[]
  days: DaySchedule[]
  total_hours?: number
  violations?: string[]
}
