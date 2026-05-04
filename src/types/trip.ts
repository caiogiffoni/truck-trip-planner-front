export type DutyStatus = 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty'
export type StopType = 'start' | 'pickup' | 'dropoff' | 'fuel' | 'rest'

export interface DutyEvent {
  status: DutyStatus
  start: number   // float hours, 0–24
  end: number
  remark?: string
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
  location: string
  coords: [number, number]  // [lng, lat]
  day: number
  time: string              // HH:MM
}

export interface TripRoute {
  total_miles: number
  total_drive_time_hrs: number
  polyline: [number, number][]  // [lng, lat]
  legs: RouteLeg[]
}

export interface TripPlanResult {
  route: TripRoute
  stops: TripStop[]
  days: DaySchedule[]
}
