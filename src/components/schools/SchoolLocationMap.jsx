import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const pinIcon = L.divIcon({
  className: 'school-map-pin',
  html: `<svg width="30" height="38" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18C24 5.4 18.6 0 12 0Z" fill="#007549"/>
    <circle cx="12" cy="12" r="5" fill="#fff"/>
  </svg>`,
  iconSize: [30, 38],
  iconAnchor: [15, 38],
})

function ClickToPlace({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

// Recenters the map whenever lat/lng change from outside the map itself (e.g. an address search).
function FlyTo({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])
  return null
}

export default function SchoolLocationMap({ lat, lng, onPick }) {
  return (
    <div className="school-map">
      <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
          maxZoom={19}
        />
        <Marker
          position={[lat, lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = e.target.getLatLng()
              onPick(p.lat, p.lng)
            },
          }}
        />
        <ClickToPlace onPick={onPick} />
        <FlyTo lat={lat} lng={lng} />
      </MapContainer>
    </div>
  )
}
