import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

let socket = null

export function getSocket() {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
        })
    }
    return socket
}

export function connectSocket() {
    const s = getSocket()
    if (!s.connected) {
        s.connect()
        console.log('🔌 Connecting to WebSocket...')
    }
    return s
}

export function disconnectSocket() {
    if (socket && socket.connected) {
        socket.disconnect()
        console.log('❌ Disconnected from WebSocket')
    }
}

// Join a specific ride room
export function joinRide(rideId) {
    const s = connectSocket()
    s.emit('join-ride', rideId)
}

// Leave a ride room
export function leaveRide(rideId) {
    const s = getSocket()
    s.emit('leave-ride', rideId)
}

// Join drivers room
export function joinDriversRoom() {
    const s = connectSocket()
    s.emit('join-drivers')
}

// Send driver's live GPS location to a ride room
export function sendDriverLocation(rideId, lat, lng) {
    const s = getSocket()
    if (s && s.connected) {
        s.emit('driver-location-update', { rideId, lat, lng })
    }
}
