# ELD Trip Planner — Frontend

React + Vite frontend for an HOS-compliant trucking trip planner. Drivers enter their current location, pickup, dropoff, and hours already used in the current 70-hr cycle. The app calls the Django backend, displays an interactive map, a full event timeline, and auto-generates ELD Daily Log Sheets drawn on top of the real FMCSA blank paper log form.

---

## Tech Stack

| | |
|---|---|
| Framework | React 19 + Vite |
| Language | TypeScript |
| Map | Leaflet.js + react-leaflet (OpenStreetMap tiles) |
| Log sheets | HTML5 Canvas API (drawn over blank FMCSA paper log PNG) |
| Styling | Plain CSS (custom design system) |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8000` (see backend repo)

### Install & run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8000
```

Change the URL to point at a deployed backend when needed.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy the folder to Vercel or any static host.

---

## Project Structure

```
src/
  components/
    TripForm.tsx        # Input form (locations + cycle hours)
    ResultsView.tsx     # Full-screen layout after trip is planned
    MapView.tsx         # Leaflet map with route polyline and markers
    StopsList.tsx       # Trip summary panel: stats + full event timeline
    LogSheetList.tsx    # Collapsible container for all daily log sheets
    LogSheet.tsx        # Single ELD canvas card with download button
  hooks/
    useTripPlan.ts      # API call + loading/error state management
  utils/
    canvasDrawer.ts     # All canvas drawing logic (pure, no React)
    timeUtils.ts        # Float-hour ↔ HH:MM string helpers
  types/
    trip.ts             # Shared TypeScript interfaces
  assets/
    blank-paper-log.png # Blank FMCSA Driver's Daily Log form (513×518px)
  App.tsx               # API call, state, routing between form and results
  index.css             # Global design system and component styles
```

---

## Features

### Trip Form

- Four inputs: current location, pickup location, dropoff location, current cycle hours used
- Visual cycle-hours progress bar (out of 70 hrs)
- Submits `POST /api/trip/plan/` to the backend
- Shows an inline error banner if the request fails

### Results Layout

- **Left 60%** — interactive Leaflet map
- **Right 40%** — Trip Summary panel + ELD Daily Logs (scrollable)

### Map

- Renders the full route polyline from the backend GeoJSON
- Color-coded markers by stop type:
  - Green — start
  - Blue — pickup
  - Red — dropoff
  - Yellow — fuel stop
  - Gray — rest

### Trip Summary Panel

Four stats at the top: **total miles**, **drive hours**, **total hours**, **days**.

Below the stats, a full chronological event timeline shows every duty status event across all days:

| Status | Color | Examples |
|---|---|---|
| Driving | Green | Driving segments with miles |
| On Duty | Amber | Pre-trip inspection, 30-min break, fuel stop, pickup, dropoff |
| Off Duty | Slate | 10-hr rest, curfew rest |
| Sleeper Berth | Blue | Sleeper periods |

Each card shows the status badge, time range, remark text, duration, and miles where applicable. Day boundaries are marked with a divider.

### ELD Daily Log Sheets

One collapsible card per day. Each card shows at a glance:
- Date and total miles for the day
- Driving hours badge
- **Download PNG** button — available without opening the card

Expanding a card reveals the full canvas rendering of the FMCSA Driver's Daily Log, filled in with:

- **Header** — date (month/day/year), From/To locations, total miles, carrier name, vehicle number
- **24-hour grid** — continuous black line tracing through all 4 duty-status rows (Off Duty · Sleeper Berth · Driving · On Duty), connected across row changes exactly like the real paper form
- **Remarks section** — each event's time and description
- **Total hours column** — per-status hour totals on the right

The canvas is drawn over the real blank FMCSA paper log PNG (`src/assets/blank-paper-log.png`, 513×518px), so the grid lines, tick marks, labels, and form structure are all from the actual DOT form — only the data is drawn programmatically.

---

## API Contract

The frontend calls one endpoint:

```
POST /api/trip/plan/
Content-Type: application/json

{
  "current_location": "Chicago, IL",
  "pickup_location": "St. Louis, MO",
  "dropoff_location": "Nashville, TN",
  "current_cycle_used": 24.5
}
```

The response is normalized in `App.tsx` to handle field variations from the backend.

---

## HOS Rules Reflected in the UI

The event timeline reflects the backend's HOS-compliant schedule per FMCSA 49 CFR Part 395:

1. 11-hour driving limit per shift
2. 14-hour on-duty window
3. 30-minute break after 8 cumulative driving hours
4. 10-hour off-duty rest between shifts
5. 70-hour / 8-day rolling cycle limit
6. Fueling stop at least every 1,000 miles (30 min, on-duty)
7. 1 hour for pickup, 1 hour for dropoff (on-duty)

---

## Design

Dark navy background with amber/orange accents. Monospaced font for all times, miles, and numbers. The canvas log sheet renders directly on top of the real DOT paper form PNG for an accurate, professional appearance.
