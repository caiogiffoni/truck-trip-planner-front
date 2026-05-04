/** Convert float hour (e.g. 6.5) to "HH:MM" string */
export function floatToTime(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Convert float hour to "H:MM AM/PM" */
export function floatToTime12(hour: number): string {
  const h = Math.floor(hour) % 24
  const m = Math.round((hour - Math.floor(hour)) * 60)
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

/** Duration between two float hours as "Xh Ym" */
export function duration(start: number, end: number): string {
  const total = end - start
  const h = Math.floor(total)
  const m = Math.round((total - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
