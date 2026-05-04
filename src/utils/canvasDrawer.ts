import type { DaySchedule, DutyStatus } from '../types/trip'
import { floatToTime } from './timeUtils'

// ── Layout constants ───────────────────────────────────────────
const W = 900
const H = 420

const HEADER_H = 80
const GRID_TOP = HEADER_H + 40        // y where duty rows start
const ROW_H = 36
const GRID_BOTTOM = GRID_TOP + ROW_H * 4
const REMARKS_TOP = GRID_BOTTOM + 24

const LEFT_LABEL_W = 110
const RIGHT_PAD = 12
const GRID_X = LEFT_LABEL_W
const GRID_W = W - GRID_X - RIGHT_PAD

const ROW_ORDER: DutyStatus[] = ['off_duty', 'sleeper_berth', 'driving', 'on_duty']
const ROW_LABELS = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty (ND)']

const STATUS_COLOR: Record<DutyStatus, string> = {
  off_duty:       '#475569',
  sleeper_berth:  '#1d4ed8',
  driving:        '#15803d',
  on_duty:        '#b45309',
}

const FONT_MONO = '11px "JetBrains Mono", "Fira Code", ui-monospace, Consolas, monospace'
const FONT_SANS = '11px system-ui, -apple-system, sans-serif'
const FONT_BOLD = 'bold 11px system-ui, -apple-system, sans-serif'

// ── Helpers ────────────────────────────────────────────────────
function xForHour(hour: number) {
  return GRID_X + (hour / 24) * GRID_W
}

function rowY(status: DutyStatus) {
  return GRID_TOP + ROW_ORDER.indexOf(status) * ROW_H
}

// ── Main draw function ─────────────────────────────────────────
export function drawLogSheet(canvas: HTMLCanvasElement, day: DaySchedule) {
  canvas.width = W
  canvas.height = H

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  drawBackground(ctx)
  drawHeader(ctx, day)
  drawGrid(ctx)
  drawEvents(ctx, day)
  drawRemarks(ctx, day)
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
}

function drawHeader(ctx: CanvasRenderingContext2D, day: DaySchedule) {
  // top border bar
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, W, 6)

  // Title
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif'
  ctx.fillText("DRIVER'S DAILY LOG", 12, 24)

  ctx.font = FONT_SANS
  ctx.fillStyle = '#64748b'
  ctx.fillText('(as required by FMCSA 49 CFR Part 395)', 12, 38)

  // Header fields
  const fields: [string, string, number, number][] = [
    ['Date', formatDate(day.date), 420, 20],
    ['Total Miles', String(day.total_miles), 420, 38],
    ['Carrier', day.carrier || '——', 650, 20],
    ['Vehicle No.', day.vehicle_number || '——', 650, 38],
  ]

  for (const [label, value, x, y] of fields) {
    ctx.font = FONT_SANS
    ctx.fillStyle = '#94a3b8'
    ctx.fillText(label + ':', x, y)
    ctx.font = FONT_MONO
    ctx.fillStyle = '#0f172a'
    ctx.fillText(value, x + 68, y)
  }

  // Separator
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, HEADER_H)
  ctx.lineTo(W, HEADER_H)
  ctx.stroke()

  // Column hour labels
  ctx.font = FONT_MONO
  ctx.fillStyle = '#64748b'
  ctx.textAlign = 'center'
  for (let h = 0; h <= 24; h += 1) {
    const x = xForHour(h)
    if (h % 2 === 0) {
      ctx.fillText(h === 0 ? 'M' : h === 12 ? 'N' : h === 24 ? 'M' : String(h), x, HEADER_H + 16)
    }
  }
  ctx.textAlign = 'left'
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  // Row labels + row backgrounds
  for (let i = 0; i < ROW_ORDER.length; i++) {
    const y = GRID_TOP + i * ROW_H

    // Alternating row bg
    ctx.fillStyle = i % 2 === 0 ? '#f8fafc' : '#f1f5f9'
    ctx.fillRect(GRID_X, y, GRID_W, ROW_H)

    // Row label
    ctx.font = FONT_BOLD
    ctx.fillStyle = '#334155'
    ctx.fillText(ROW_LABELS[i], 8, y + ROW_H / 2 + 4)

    // Row border
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }

  // Bottom border of grid
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(0, GRID_BOTTOM)
  ctx.lineTo(W, GRID_BOTTOM)
  ctx.stroke()

  // Left label divider
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(GRID_X, GRID_TOP)
  ctx.lineTo(GRID_X, GRID_BOTTOM)
  ctx.stroke()

  // Vertical tick marks
  for (let h = 0; h <= 24; h += 0.25) {
    const x = xForHour(h)
    const isMajor = h % 1 === 0
    const isHalf = h % 0.5 === 0 && !isMajor

    ctx.strokeStyle = isMajor ? '#94a3b8' : isHalf ? '#cbd5e1' : '#e2e8f0'
    ctx.lineWidth = isMajor ? 1 : 0.5

    const tickH = isMajor ? ROW_H * 4 : isHalf ? ROW_H * 0.5 : ROW_H * 0.25

    ctx.beginPath()
    ctx.moveTo(x, GRID_BOTTOM - tickH)
    ctx.lineTo(x, GRID_BOTTOM)
    ctx.stroke()
  }
}

function drawEvents(ctx: CanvasRenderingContext2D, day: DaySchedule) {
  for (const event of day.events) {
    const x1 = xForHour(event.start)
    const x2 = xForHour(event.end)
    const y = rowY(event.status)
    const w = x2 - x1

    if (w <= 0) continue

    ctx.fillStyle = STATUS_COLOR[event.status]
    ctx.globalAlpha = 0.85
    ctx.fillRect(x1, y + 4, w, ROW_H - 8)
    ctx.globalAlpha = 1

    // Vertical marker at start
    ctx.strokeStyle = STATUS_COLOR[event.status]
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x1, GRID_TOP)
    ctx.lineTo(x1, GRID_BOTTOM)
    ctx.stroke()
  }
}

function drawRemarks(ctx: CanvasRenderingContext2D, day: DaySchedule) {
  ctx.font = FONT_BOLD
  ctx.fillStyle = '#334155'
  ctx.fillText('REMARKS', 12, REMARKS_TOP)

  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, REMARKS_TOP + 4)
  ctx.lineTo(W, REMARKS_TOP + 4)
  ctx.stroke()

  const remarked = day.events.filter(e => e.remark)
  let y = REMARKS_TOP + 18
  for (const event of remarked) {
    ctx.font = FONT_MONO
    ctx.fillStyle = '#475569'
    ctx.fillText(floatToTime(event.start), 12, y)
    ctx.fillStyle = '#0f172a'
    ctx.font = FONT_SANS
    ctx.fillText('— ' + event.remark!, 58, y)
    y += 16
    if (y > H - 8) break
  }
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}
