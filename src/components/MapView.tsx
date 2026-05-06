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
  start:   '#22c55e',
  pickup:  '#60a5fa',
  dropoff: '#ef4444',
  fuel:    '#f59e0b',
  rest:    '#94a3b8',
}

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;
      border-radius:50%;
      background:${color};
      border:2.5px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
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

export default function MapView({ data }: MapViewProps) {
  // polyline is [lng, lat] → Leaflet wants [lat, lng]
  const polylinePositions: [number, number][] = data.route.polyline.map(
    ([lng, lat]) => [lat, lng]
  )

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

        {polylinePositions.length > 1 && (
          <>
            <FitBounds positions={polylinePositions} />
            {/* Shadow */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#000', weight: 6, opacity: 0.15 }}
            />
            {/* Route line */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#f59e0b', weight: 3, opacity: 0.9 }}
            />
          </>
        )}

        {data.stops.filter(s => s.coords).map((stop, i) => (
          <Marker
            key={i}
            position={[stop.coords![1], stop.coords![0]]}
            icon={makeIcon(STOP_COLORS[stop.type])}
          >
            <Popup>
              <strong style={{ textTransform: 'capitalize' }}>{stop.type}</strong><br />
              {stop.location}<br />
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                Day {stop.day} · {stop.time}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
