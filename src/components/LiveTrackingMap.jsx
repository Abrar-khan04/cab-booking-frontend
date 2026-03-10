import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useState, useEffect } from 'react'
import { connectSocket, joinRide } from '../services/socket'

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

const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

// Smoothly move map to follow driver
function FollowDriver({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) {
            map.panTo(position, { animate: true, duration: 1 })
        }
    }, [position, map])
    return null
}

// Fit all points in view
function FitBounds({ points }) {
    const map = useMap()
    useEffect(() => {
        if (points.length >= 2) {
            const bounds = L.latLngBounds(points)
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
        }
    }, []) // Only on mount
    return null
}

export default function LiveTrackingMap({ ride }) {
    const [driverPos, setDriverPos] = useState(null)
    const [routeCoords, setRouteCoords] = useState([])

    // Listen for driver location updates via socket
    useEffect(() => {
        const socket = connectSocket()
        joinRide(ride.id)

        socket.on('driver-location', (data) => {
            if (data.rideId === ride.id) {
                setDriverPos([data.lat, data.lng])
            }
        })

        return () => {
            socket.off('driver-location')
        }
    }, [ride.id])

    // Fetch road route from OSRM
    useEffect(() => {
        async function fetchRoute() {
            const waypoints = []
            if (ride.pickup_lat && ride.pickup_lng) waypoints.push({ lat: ride.pickup_lat, lng: ride.pickup_lng })
            if (ride.stops && ride.stops.length > 0) {
                ride.stops.forEach(s => waypoints.push({ lat: s.lat, lng: s.lng }))
            }
            if (ride.dropoff_lat && ride.dropoff_lng) waypoints.push({ lat: ride.dropoff_lat, lng: ride.dropoff_lng })

            if (waypoints.length < 2) return

            const coordString = waypoints.map(p => `${p.lng},${p.lat}`).join(';')
            try {
                const res = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`
                )
                const data = await res.json()
                if (data.code === 'Ok' && data.routes?.length > 0) {
                    setRouteCoords(data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]))
                }
            } catch (err) {
                console.error('Route fetch error:', err)
            }
        }
        fetchRoute()
    }, [ride])

    const pickup = ride.pickup_lat ? [ride.pickup_lat, ride.pickup_lng] : null
    const dropoff = ride.dropoff_lat ? [ride.dropoff_lat, ride.dropoff_lng] : null
    const center = driverPos || pickup || [12.9716, 77.5946]

    const allPoints = []
    if (pickup) allPoints.push(pickup)
    if (dropoff) allPoints.push(dropoff)
    if (driverPos) allPoints.push(driverPos)

    return (
        <div className="rounded-2xl overflow-hidden border border-white/10 mb-4">
            <div className="relative">
                <MapContainer
                    center={center}
                    zoom={14}
                    style={{ height: '280px', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Pickup marker */}
                    {pickup && <Marker position={pickup} icon={pickupIcon} />}

                    {/* Dropoff marker */}
                    {dropoff && <Marker position={dropoff} icon={dropoffIcon} />}

                    {/* Driver marker (live) */}
                    {driverPos && <Marker position={driverPos} icon={driverIcon} />}

                    {/* Road route */}
                    {routeCoords.length >= 2 && (
                        <Polyline
                            positions={routeCoords}
                            pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.8 }}
                        />
                    )}

                    {/* Fit bounds on mount */}
                    {allPoints.length >= 2 && <FitBounds points={allPoints} />}

                    {/* Follow driver as they move */}
                    {driverPos && <FollowDriver position={driverPos} />}
                </MapContainer>

                {/* Live indicator */}
                {driverPos && (
                    <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-[10px] text-green-400 font-bold uppercase">Live</span>
                    </div>
                )}

                {/* Waiting for driver indicator */}
                {!driverPos && ride.driver_id && (
                    <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="text-[10px] text-amber-400 font-bold uppercase">Waiting for GPS</span>
                    </div>
                )}
            </div>
        </div>
    )
}
