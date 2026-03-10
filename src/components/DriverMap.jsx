import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useState, useEffect } from 'react'

const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41],
})

const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41],
})

const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41],
})

function FitBounds({ points }) {
    const map = useMap()
    useEffect(() => {
        if (points.length >= 2) {
            map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 })
        } else if (points.length === 1) {
            map.setView(points[0], 15)
        }
    }, [])
    return null
}

export default function DriverMap({ ride }) {
    const [driverPos, setDriverPos] = useState(null)
    const [routeCoords, setRouteCoords] = useState([])

    // Get driver's live GPS
    useEffect(() => {
        if (!navigator.geolocation) return
        const watchId = navigator.geolocation.watchPosition(
            (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
            (err) => console.error('GPS:', err.message),
            { enableHighAccuracy: true, maximumAge: 3000 }
        )
        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    // Decide which destination to show based on ride status
    const isInProgress = ride.status === 'in_progress'
    const destLat = isInProgress ? ride.dropoff_lat : ride.pickup_lat
    const destLng = isInProgress ? ride.dropoff_lng : ride.pickup_lng
    const destIcon = isInProgress ? dropoffIcon : pickupIcon
    const destLabel = isInProgress ? 'Drop-off' : 'Pickup'

    // Fetch road route from driver → destination
    useEffect(() => {
        async function fetchRoute() {
            if (!driverPos || !destLat || !destLng) return
            const coordStr = `${driverPos[1]},${driverPos[0]};${destLng},${destLat}`
            try {
                const res = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`
                )
                const data = await res.json()
                if (data.code === 'Ok' && data.routes?.length > 0) {
                    setRouteCoords(data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]))
                }
            } catch (_) { }
        }
        fetchRoute()
    }, [driverPos, destLat, destLng])

    const destPoint = destLat ? [destLat, destLng] : null
    const allPoints = []
    if (driverPos) allPoints.push(driverPos)
    if (destPoint) allPoints.push(destPoint)
    const center = driverPos || destPoint || [12.9716, 77.5946]

    return (
        <div className="rounded-2xl overflow-hidden border border-white/10 mb-4 relative">
            {/* Label */}
            <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-xs font-bold text-white">
                    {isInProgress ? '🟢 Navigate to Drop-off' : '🟡 Navigate to Pickup'}
                </span>
            </div>

            <MapContainer center={center} zoom={14} style={{ height: '240px', width: '100%' }} zoomControl={false}>
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Driver's position */}
                {driverPos && <Marker position={driverPos} icon={driverIcon} />}

                {/* Destination marker (pickup or dropoff depending on status) */}
                {destPoint && <Marker position={destPoint} icon={destIcon} />}

                {/* Route line from driver to destination */}
                {routeCoords.length >= 2 && (
                    <Polyline
                        positions={routeCoords}
                        pathOptions={{ color: isInProgress ? '#4ade80' : '#f59e0b', weight: 4, opacity: 0.85 }}
                    />
                )}

                {allPoints.length >= 1 && <FitBounds points={allPoints} />}
            </MapContainer>
        </div>
    )
}
