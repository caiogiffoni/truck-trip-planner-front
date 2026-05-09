import type { DaySchedule } from '../types/trip'
import blankFormPng from '../assets/blank-paper-log.png'

export interface LogSheetMeta {
  carrierName?: string
  vehicleNumber?: string
  tripStartDate?: string
}

export function drawLogSheet(
  canvas: HTMLCanvasElement,
  day: DaySchedule,
  meta?: LogSheetMeta,
): void {
  const ctx = canvas.getContext('2d')!
  canvas.width  = 513
  canvas.height = 518

  const img = new Image()
  img.src = blankFormPng
  img.onload = () => {
    ctx.drawImage(img, 0, 0, 513, 518)
    drawData(ctx, day, meta)
  }
}

function drawData(
  ctx: CanvasRenderingContext2D,
  day: DaySchedule,
  meta?: LogSheetMeta,
): void {
  ctx.font      = '7px Arial'
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'

  // ── Section A: header fields ────────────────────────────────────────

  // Date — parse from day.date (YYYY-MM-DD)
  if (day.date) {
    const [yearStr, monthStr, dayStr] = day.date.split('-')
    ctx.font = '9px Arial'
    ctx.fillText(monthStr, 187, 17)
    ctx.fillText(dayStr,   229, 17)
    ctx.fillText(yearStr,  271, 17)
    ctx.font = '7px Arial'
  }

  // Total Miles Driving Today — box x=52-136, y=68-94
  ctx.font = '11px Arial'
  ctx.fillText(String(Math.round(day.total_miles ?? 0)), 94, 84)
  ctx.font = '7px Arial'

  // Carrier name — underline at x=260-465, y=99
  const carrier = meta?.carrierName ?? day.carrier ?? ''
  if (carrier) {
    ctx.fillText(carrier, 362, 96)
  }

  // Vehicle number — box on left (x=52-217 area, y=110-120)
  const vehicle = meta?.vehicleNumber ?? day.vehicle_number ?? ''
  if (vehicle) {
    ctx.font      = '11px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(vehicle, 56, 118)
    ctx.font      = '15px Arial'
    ctx.textAlign = 'center'
  }

  // ── Section B: 24-hour graph grid ───────────────────────────────────

  const GRID_X = 56
  const GRID_W = 436
  const ROW_H  = 15

  const ROW_Y: Record<string, number> = {
    off_duty:      185,
    sleeper_berth: 202,
    driving:       219,
    on_duty:       236,
  }

  const STATUS_COLORS: Record<string, string> = {
    off_duty:      'rgba(107, 114, 128, 0.6)',
    sleeper_berth: 'rgba(59,  130, 246, 0.6)',
    driving:       'rgba(34,  197,  94, 0.7)',
    on_duty:       'rgba(245, 158,  11, 0.7)',
  }

  // Convert hour float to x pixel
  const toX = (hour: number) => GRID_X + (hour / 24) * GRID_W

  console.log('Drawing day events:', JSON.stringify(day.events, null, 2))

  for (const event of day.events) {
    // Normalize status key — lowercase, replace spaces with underscores
    const status = event.status?.toLowerCase().replace(/\s+/g, '_').trim()
    const color  = STATUS_COLORS[status]
    if (!color) continue

    const x1 = toX(event.start)
    const x2 = toX(event.end)
    const y  = ROW_Y[status]
    if (y === undefined) continue

    ctx.fillStyle = color
    ctx.fillRect(x1, y, x2 - x1, ROW_H)

    // Vertical line at each status change
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.lineWidth   = 0.5
    ctx.beginPath()
    ctx.moveTo(x1, ROW_Y.off_duty)
    ctx.lineTo(x1, ROW_Y.on_duty + ROW_H)
    ctx.stroke()
  }

  // ── Section C: remarks ───────────────────────────────────────────────

  const toHHMM = (hour: number) => {
    const h = Math.floor(hour)
    const m = Math.round((hour % 1) * 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  ctx.font      = '7px Arial'
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'left'

  const remarks = day.events.filter(e =>
    e.remark &&
    e.remark.trim() !== '' &&
    e.remark !== 'Off duty' &&
    e.remark !== 'Off duty (pre-shift)'
  )

  let lineY = 285
  for (const event of remarks.slice(0, 7)) {
    ctx.fillText(`${toHHMM(event.start)} — ${event.remark}`, 60, lineY)
    lineY += 10
  }

  // ── Section D: total hours (right column) ────────────────────────────

  const normalizeStatus = (s: string) => s?.toLowerCase().replace(/\s+/g, '_').trim()
  const sumHours = (status: string) =>
    day.events
      .filter(e => normalizeStatus(e.status) === status)
      .reduce((sum, e) => sum + (e.end - e.start), 0)

  ctx.textAlign = 'right'
  ctx.font      = '8px Arial'
  ctx.fillStyle = '#000000'

  ctx.fillText(sumHours('off_duty').toFixed(1),      510, 192)
  ctx.fillText(sumHours('sleeper_berth').toFixed(1), 510, 209)
  ctx.fillText(sumHours('driving').toFixed(1),       510, 226)
  ctx.fillText(sumHours('on_duty').toFixed(1),       510, 243)
}
