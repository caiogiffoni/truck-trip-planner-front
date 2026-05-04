import type { TripPlanResult } from './types/trip'

export const MOCK_TRIP: TripPlanResult = {
  route: {
    total_miles: 542,
    total_drive_time_hrs: 8.2,
    polyline: [
      [-87.6298, 41.8781],
      [-88.2, 41.5],
      [-89.0, 40.8],
      [-90.1994, 38.6270],
      [-90.5, 37.8],
      [-87.3, 36.1659],
      [-86.7816, 36.1627],
    ],
    legs: [
      { from: 'Chicago, IL', to: 'St. Louis, MO', miles: 297, drive_hrs: 4.5 },
      { from: 'St. Louis, MO', to: 'Nashville, TN', miles: 245, drive_hrs: 3.7 },
    ],
  },
  stops: [
    { type: 'start',   location: 'Chicago, IL',      coords: [-87.6298, 41.8781], day: 1, time: '07:00' },
    { type: 'pickup',  location: 'St. Louis, MO',    coords: [-90.1994, 38.6270], day: 1, time: '14:00' },
    { type: 'rest',    location: 'Cape Girardeau, MO', coords: [-89.5185, 37.3059], day: 1, time: '18:00' },
    { type: 'dropoff', location: 'Nashville, TN',    coords: [-86.7816, 36.1627], day: 2, time: '10:00' },
  ],
  days: [
    {
      day: 1,
      date: '2026-05-04',
      total_miles: 350,
      vehicle_number: 'TRK-4821',
      carrier: 'Demo Carrier LLC',
      events: [
        { status: 'off_duty',  start: 0.0,  end: 6.0 },
        { status: 'on_duty',   start: 6.0,  end: 7.0,  remark: 'Pre-trip inspection, Chicago IL' },
        { status: 'driving',   start: 7.0,  end: 11.0, remark: 'Driving toward St. Louis' },
        { status: 'on_duty',   start: 11.0, end: 11.5, remark: '30-min break' },
        { status: 'driving',   start: 11.5, end: 14.0, remark: 'Driving' },
        { status: 'on_duty',   start: 14.0, end: 15.0, remark: 'Pickup, St. Louis MO' },
        { status: 'driving',   start: 15.0, end: 18.0, remark: 'Driving toward Nashville' },
        { status: 'off_duty',  start: 18.0, end: 24.0, remark: 'Rest, Cape Girardeau MO' },
      ],
    },
    {
      day: 2,
      date: '2026-05-05',
      total_miles: 192,
      vehicle_number: 'TRK-4821',
      carrier: 'Demo Carrier LLC',
      events: [
        { status: 'off_duty',  start: 0.0,  end: 4.0 },
        { status: 'on_duty',   start: 4.0,  end: 4.5,  remark: 'Pre-trip inspection' },
        { status: 'driving',   start: 4.5,  end: 9.0,  remark: 'Driving to Nashville' },
        { status: 'on_duty',   start: 9.0,  end: 10.0, remark: 'Dropoff, Nashville TN' },
        { status: 'off_duty',  start: 10.0, end: 24.0, remark: 'End of trip' },
      ],
    },
  ],
}
