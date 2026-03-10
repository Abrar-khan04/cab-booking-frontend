import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useState, useEffect } from 'react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

const stopIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

// Click handler component
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng)
        },
    })
    return null
}

// Auto-fit all markers in view
function FitBounds({ points }) {
    const map = useMap()
    useEffect(() => {
        if (points.length >= 2) {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]))
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, duration: 1 })
        }
    }, [points, map])
    return null
}

// Fly to a single point
function FlyToLocation({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 1.5 })
        }
    }, [position, map])
    return null
}

export default function MapPicker({ pickup, dropoff, stops = [], onPickupSet, onDropoffSet, selectingMode }) {
    const defaultCenter = [12.9716, 77.5946] // Bangalore
    const [routeCoords, setRouteCoords] = useState([])

    // Fetch real road route from OSRM (free, no API key needed)
    useEffect(() => {
        async function fetchRoute() {
            // Build waypoints: pickup → stops → dropoff
            const waypoints = []
            if (pickup) waypoints.push(pickup)
            if (stops && stops.length > 0) {
                stops.filter(Boolean).forEach(s => waypoints.push(s))
            }
            if (dropoff) waypoints.push(dropoff)

            // Need at least 2 points for a route
            if (waypoints.length < 2) {
                setRouteCoords([])
                return
            }

            // OSRM expects coordinates as lng,lat (not lat,lng!)
            const coordString = waypoints.map(p => `${p.lng},${p.lat}`).join(';')

            try {
                const res = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`
                )
                const data = await res.json()

                if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                    // OSRM returns [lng, lat], Leaflet needs [lat, lng]
                    const coords = data.routes[0].geometry.coordinates.map(
                        ([lng, lat]) => [lat, lng]
                    )
                    setRouteCoords(coords)
                }
            } catch (err) {
                console.error('Route fetch error:', err)
                // Fallback to straight lines
                setRouteCoords(waypoints.map(p => [p.lat, p.lng]))
            }
        }

        fetchRoute()
    }, [pickup, dropoff, stops])

    const handleMapClick = async (latlng) => {
        const { lat, lng } = latlng

        // Reverse geocode to get address
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`)
            const data = await res.json()
            const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

            if (selectingMode === 'pickup') {
                onPickupSet({ lat, lng, address })
            } else {
                onDropoffSet({ lat, lng, address })
            }
        } catch {
            const address = `${lat.toFixed(4)},${lng.toFixed(4)}`
            if (selectingMode === 'pickup') {
                onPickupSet({ lat, lng, address })
            } else {
                onDropoffSet({ lat, lng, address })
            }
        }
    }

    // All points for FitBounds
    const allPoints = []
    if (pickup) allPoints.push(pickup)
    if (stops) stops.filter(Boolean).forEach(s => allPoints.push(s))
    if (dropoff) allPoints.push(dropoff)

    return (
        <div className='rounded-2xl overflow-hidden border border-white/10'>
            <MapContainer
                center={pickup ? [pickup.lat, pickup.lng] : defaultCenter}
                zoom={13}
                style={{ height: '350px', width: '100%' }}
                zoomControl={false}>

                <TileLayer attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

                <MapClickHandler onMapClick={handleMapClick} />

                {/* Pickup marker */}
                {pickup && (
                    <>
                        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
                        {allPoints.length < 2 && <FlyToLocation position={[pickup.lat, pickup.lng]} />}
                    </>
                )}

                {/* Stop markers */}
                {stops && stops.filter(Boolean).map((stop, i) => (
                    <Marker key={`stop-${i}`} position={[stop.lat, stop.lng]} icon={stopIcon} />
                ))}

                {/* Dropoff marker */}
                {dropoff && (
                    <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} />
                )}

                {/* Real road route */}
                {routeCoords.length >= 2 && (
                    <Polyline
                        positions={routeCoords}
                        pathOptions={{
                            color: '#f59e0b',
                            weight: 4,
                            opacity: 0.9,
                        }}
                    />
                )}

                {/* Auto-fit when we have 2+ points */}
                {allPoints.length >= 2 && <FitBounds points={allPoints} />}
            </MapContainer>
        </div>
    )
}