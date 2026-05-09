import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { TripPlanResult, TripStop } from '../types/trip'

// Fix Leaflet's broken default icon path with bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STOP_COLORS: Record<TripStop['type'], string> = {
  start:   '#00d975',
  pickup:  '#42b4ff',
  dropoff: '#ff3232',
  fuel:    '#ff9500',
  rest:    '#94a3b8',
  break:   '#a78bfa',
}

const WAYPOINT_LABELS: Record<string, string> = {
  start:   'Start',
  pickup:  'Pickup',
  dropoff: 'Dropoff',
}

function makeIcon(color: string, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color};
      border:2.5px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

function makeWaypointIcon(color: string, letter: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;
      border-radius:50%;
      background:${color};
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.55);
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:800;color:#fff;font-family:sans-serif;
      line-height:1;
    ">${letter}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
  })
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] })
    }
  }, [map, positions])
  return null
}

interface MapViewProps {
  data: TripPlanResult
}

const WAYPOINT_TYPES = ['start', 'pickup', 'dropoff'] as const
const WAYPOINT_LETTERS = ['S', 'P', 'D']

export default function MapView({ data }: MapViewProps) {
  // polyline is [lng, lat] → Leaflet wants [lat, lng]
  const polylinePositions: [number, number][] = data.route.polyline.map(
    ([lng, lat]) => [lat, lng]
  )

  // waypoints [lng, lat] → [lat, lng] for Leaflet
  const waypoints = data.route.waypoints ?? []
  const waypointLatLngs: [number, number][] = waypoints.map(([lng, lat]) => [lat, lng])

  // FitBounds: prefer polyline, fall back to waypoints
  const boundsPositions = polylinePositions.length > 1 ? polylinePositions : waypointLatLngs

  // Stops to render as small dots: fuel + rest only
  const dotStops = data.stops.filter(s => s.coords && !WAYPOINT_TYPES.includes(s.type as typeof WAYPOINT_TYPES[number]))

  // Waypoint metadata: find matching stop for label/time
  const waypointMeta = WAYPOINT_TYPES.map(type => data.stops.find(s => s.type === type))

  return (
    <div className="map-container">
      <MapContainer
        center={[39.5, -98.35]}
        zoom={5}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {boundsPositions.length > 1 && <FitBounds positions={boundsPositions} />}

        {polylinePositions.length > 1 && (
          <>
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#000', weight: 6, opacity: 0.15 }}
            />
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#ff9500', weight: 3, opacity: 0.9 }}
            />
          </>
        )}

        {/* Waypoint markers: Start (S), Pickup (P), Dropoff (D) */}
        {waypointLatLngs.map((pos, i) => {
          const type = WAYPOINT_TYPES[i]
          const meta = waypointMeta[i]
          return (
            <Marker
              key={`wp-${i}`}
              position={pos}
              icon={makeWaypointIcon(STOP_COLORS[type], WAYPOINT_LETTERS[i])}
            >
              <Popup>
                <strong>{WAYPOINT_LABELS[type]}</strong><br />
                {meta?.location}<br />
                {meta?.remark && (
                  <span style={{ display: 'block', fontSize: '12px', margin: '2px 0' }}>{meta.remark}</span>
                )}
                {meta && (
                  <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    Day {meta.day} · {meta.time_start}{meta.time_end ? `–${meta.time_end}` : ''}
                  </span>
                )}
              </Popup>
            </Marker>
          )
        })}

        {/* Fuel + rest stop dots */}
        {dotStops.map((stop, i) => (
          <Marker
            key={`stop-${i}`}
            position={[stop.coords![1], stop.coords![0]]}
            icon={makeIcon(STOP_COLORS[stop.type])}
          >
            <Popup>
              <strong style={{ textTransform: 'capitalize' }}>{stop.type}</strong><br />
              {stop.location}<br />
              {stop.remark && (
                <span style={{ display: 'block', fontSize: '12px', margin: '2px 0' }}>{stop.remark}</span>
              )}
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                Day {stop.day} · {stop.time_start}{stop.time_end ? `–${stop.time_end}` : ''}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
