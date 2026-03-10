import { useUser, UserButton } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAvailableRides, updateRideStatus, getProfile, updateProfile, verifyRideOTP } from '../services/api'
import { joinDriversRoom, connectSocket, sendDriverLocation } from '../services/socket'
import { useToast } from '../components/Toast'
import DriverMap from '../components/DriverMap'


export default function DriverDashboard() {
    const { user } = useUser()
    const navigate = useNavigate()
    const [rides, setRides] = useState([])
    const [loading, setLoading] = useState(true)
    const [isOnline, setIsOnline] = useState(false)
    const [accepting, setAccepting] = useState(null)
    const [myRides, setMyRides] = useState([])
    const [otpInputs, setOtpInputs] = useState({}) // rideId → otp string
    const [otpLoading, setOtpLoading] = useState(null) // rideId being verified
    const { addToast } = useToast()

    const fetchRides = async () => {
        try {
            const data = await getAvailableRides()
            setRides(data.rides || [])
        } catch (err) {
            console.error("Failed to fetch rides", err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        async function loadDriver() {
            try {
                const data = await getProfile()
                if (data.user) {
                    setIsOnline(data.user.is_available || false)
                    if (data.user.role !== 'driver') {
                        const confrim = window.confirm("your account is set as 'Rider'. Switch to driver mode?")
                        if (confrim) {
                            await updateProfile({ role: 'driver' })
                        } else {
                            navigate('/dashboard')
                            return
                        }
                    }
                }
            } catch (err) {
                console.error('Load driver error', err.message)
            }
        }
        loadDriver()
    }, [navigate])
    // Auto-refresh rides every 10 seconds
    useEffect(() => {
        fetchRides()
        const interval = setInterval(fetchRides, 10000)
        return () => clearInterval(interval)
    }, [])

    // Real-time socket: listen for new rides
    useEffect(() => {
        const socket = connectSocket()
        joinDriversRoom()

        socket.on('new-ride', (data) => {
            setRides((prev) => [data.ride, ...prev])
            addToast('🚕 New ride request nearby!', 'warning')
        })

        socket.on('ride-accepted', (data) => {
            setRides((prev) => prev.filter((r) => r.id !== data.rideId))
        })

        return () => {
            socket.off('new-ride')
            socket.off('ride-accepted')
        }
    }, [])

    // Broadcast driver GPS location every 5 seconds for active rides
    useEffect(() => {
        if (myRides.length === 0) return

        let watchId = null
        let intervalId = null
        let currentPos = null

        // Watch GPS position
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    currentPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                },
                (err) => console.error('GPS error:', err.message),
                { enableHighAccuracy: true, maximumAge: 3000 }
            )

            // Send location every 5 seconds
            intervalId = setInterval(() => {
                if (currentPos) {
                    myRides.forEach((ride) => {
                        if (!['completed', 'cancelled'].includes(ride.status)) {
                            sendDriverLocation(ride.id, currentPos.lat, currentPos.lng)
                        }
                    })
                }
            }, 5000)
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId)
            if (intervalId) clearInterval(intervalId)
        }
    }, [myRides])

    // Toggle online/offline
    const toggleOnline = async () => {
        try {
            const newStatus = !isOnline
            setIsOnline(newStatus)
        } catch (err) {
            console.error('toggle error:', err.message)

        }
    }

    // Accept a ride
    const handleAccept = async (rideId) => {
        setAccepting(rideId)
        try {
            await updateRideStatus(rideId, 'accepted')
            const acceptedRide = rides.find((r) => r.id === rideId)
            setRides(rides.filter((r) => r.id !== rideId))
            if (acceptedRide) setMyRides([{ ...acceptedRide, status: 'accepted' }, ...myRides])
            addToast('✅ Ride accepted! Navigate to pickup.', 'success')
        } catch (err) {
            addToast('❌ Failed to accept: ' + err.message, 'error')
        } finally {
            setAccepting(null)
        }
    }

    // Update ride status (accepted → arriving → completed/cancelled)
    const handleStatusUpdate = async (rideId, newStatus) => {
        try {
            await updateRideStatus(rideId, newStatus)
            setMyRides(myRides.map((r) =>
                r.id === rideId ? { ...r, status: newStatus } : r
            ))
            if (newStatus === 'completed') addToast('🎉 Ride completed!', 'success')
        } catch (err) {
            addToast('❌ Error: ' + err.message, 'error')
        }
    }

    // Verify OTP to start the ride
    const handleVerifyOTP = async (rideId) => {
        const otp = otpInputs[rideId] || ''
        if (!otp || otp.length !== 4) {
            addToast('Enter the 4-digit OTP from the rider', 'warning')
            return
        }
        setOtpLoading(rideId)
        try {
            await verifyRideOTP(rideId, otp)
            setMyRides(myRides.map((r) =>
                r.id === rideId ? { ...r, status: 'in_progress' } : r
            ))
            setOtpInputs((prev) => ({ ...prev, [rideId]: '' }))
            addToast('✅ OTP verified! Ride started.', 'success')
        } catch (err) {
            addToast('❌ ' + err.message, 'error')
        } finally {
            setOtpLoading(null)
        }
    }
    const statusColors = {
        requested: 'text-yellow-400 bg-yellow-400/10',
        accepted: 'text-blue-400 bg-blue-400/10',
        arriving: 'text-purple-400 bg-purple-400/10',
        in_progress: 'text-green-400 bg-green-400/10',
        completed: 'text-neutral-400 bg-neutral-400/10',
        cancelled: 'text-red-400 bg-red-400/10',
    }
    const statusLabels = {
        requested: 'Waiting',
        accepted: 'Accepted',
        arriving: 'Arriving',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
    }
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Top Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center">
                            <span className="text-black font-black text-base">C</span>
                        </div>
                        <span className="text-lg font-bold hidden sm:block">
                            <span className="text-amber-400">Cab</span>Booking
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {/* Online/Offline Toggle */}
                        <button
                            onClick={toggleOnline}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isOnline
                                ? 'bg-green-400/10 text-green-400 border border-green-400/30'
                                : 'bg-red-400/10 text-red-400 border border-red-400/30'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                        </button>
                        <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 ring-2 ring-amber-400/30" } }} />
                    </div>
                </div>
            </nav>
            <div className="max-w-4xl mx-auto px-4 md:px-6 pt-24 pb-24 md:pb-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="text-neutral-500 text-sm mb-1">Driver Mode 🚗</p>
                        <h1 className="text-2xl md:text-3xl font-black">
                            Hey, <span className="text-amber-400">{user?.firstName}</span>
                        </h1>
                    </div>
                    <Link to="/dashboard" className="text-xs text-neutral-500 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/5 transition">
                        Switch to Rider
                    </Link>
                </div>
                {/* Driver Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { icon: '🚗', label: 'Rides Today', value: myRides.length.toString() },
                        { icon: '💰', label: 'Earnings', value: '₹0' },
                        { icon: '⭐', label: 'Rating', value: '4.9' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#111111] border border-white/5 rounded-2xl p-5 text-center">
                            <div className="text-xl mb-1">{stat.icon}</div>
                            <div className="text-xl font-black text-amber-400">{stat.value}</div>
                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
                {/* My Active Rides */}
                {myRides.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                            <span>🟢</span> Active Rides
                        </h2>
                        <div className="space-y-3">
                            {myRides.filter((r) => r.status !== 'completed').map((ride) => (
                                <div key={ride.id} className="bg-[#111111] border border-amber-400/20 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🚗</span>
                                            <span className="font-bold capitalize">{ride.ride_type}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${statusColors[ride.status]}`}>
                                            {statusLabels[ride.status]}
                                        </span>
                                    </div>

                                    {/* Map — navigate to pickup or dropoff */}
                                    {(ride.pickup_lat || ride.dropoff_lat) && (
                                        <DriverMap ride={ride} />
                                    )}

                                    {/* PICKUP — always shown */}
                                    <div className="flex items-start gap-2 mb-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                                        <div>
                                            <div className="text-[10px] text-neutral-500 uppercase">Pickup</div>
                                            <div className="text-sm">{ride.pickup_address}</div>
                                        </div>
                                    </div>

                                    {/* DROPOFF — shown only after OTP verified (in_progress) */}
                                    {ride.status === 'in_progress' && (
                                        <div className="flex items-start gap-2 mb-4">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-green-400 mt-1.5 flex-shrink-0"></div>
                                            <div>
                                                <div className="text-[10px] text-green-400 uppercase font-bold">Drop-off (Unlocked ✓)</div>
                                                <div className="text-sm text-green-300">{ride.dropoff_address}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* OTP INPUT — shown when arriving */}
                                    {ride.status === 'arriving' && (
                                        <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4 mb-4">
                                            <div className="text-xs text-purple-400 font-bold mb-1 uppercase tracking-wider">🔐 Enter Rider OTP to Start</div>
                                            <div className="text-xs text-neutral-400 mb-3">Ask the rider for their 4-digit OTP</div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    maxLength={4}
                                                    value={otpInputs[ride.id] || ''}
                                                    onChange={(e) => setOtpInputs((prev) => ({ ...prev, [ride.id]: e.target.value.slice(0, 4) }))}
                                                    placeholder="1234"
                                                    className="flex-1 bg-[#1a1a1a] border border-purple-400/30 rounded-xl px-4 py-3 text-white text-center text-xl font-black tracking-widest focus:outline-none focus:border-purple-400"
                                                />
                                                <button
                                                    onClick={() => handleVerifyOTP(ride.id)}
                                                    disabled={otpLoading === ride.id}
                                                    className="px-5 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-400 transition disabled:opacity-50 active:scale-[0.98]"
                                                >
                                                    {otpLoading === ride.id ? '...' : '✓ Verify'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {ride.fare && (
                                        <div className="text-amber-400 font-black text-lg mb-4">₹{Math.round(ride.fare)}</div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="flex gap-2">
                                        {ride.status === 'accepted' && (
                                            <button
                                                onClick={() => handleStatusUpdate(ride.id, 'arriving')}
                                                className="flex-1 bg-purple-500/20 text-purple-400 border border-purple-400/30 py-3 rounded-xl font-bold text-sm hover:bg-purple-500/30 transition active:scale-[0.98]"
                                            >
                                                🚗 I'm Arriving at Pickup
                                            </button>
                                        )}
                                        {ride.status === 'in_progress' && (
                                            <button
                                                onClick={() => handleStatusUpdate(ride.id, 'completed')}
                                                className="flex-1 bg-amber-400 text-black py-3 rounded-xl font-bold text-sm hover:bg-amber-300 transition active:scale-[0.98]"
                                            >
                                                ✅ Complete Ride
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleStatusUpdate(ride.id, 'cancelled')}
                                            className="px-4 py-3 bg-red-400/10 text-red-400 border border-red-400/20 rounded-xl text-sm font-semibold hover:bg-red-400/20 transition"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Available Rides */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold flex items-center gap-2">
                            <span>📋</span> Available Rides
                        </h2>
                        <button
                            onClick={fetchRides}
                            className="text-xs text-amber-400 font-semibold hover:underline"
                        >
                            ↻ Refresh
                        </button>
                    </div>
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="text-amber-400 text-lg mb-2">Loading rides...</div>
                            <div className="text-neutral-500 text-sm">Checking for nearby requests</div>
                        </div>
                    ) : rides.length === 0 ? (
                        <div className="text-center py-16 bg-[#111111] border border-white/5 rounded-2xl">
                            <div className="text-4xl mb-3">🔍</div>
                            <div className="text-neutral-400 font-semibold mb-1">No rides available</div>
                            <div className="text-neutral-600 text-sm">New requests will appear here automatically</div>
                            <div className="text-neutral-600 text-xs mt-2">Auto-refreshes every 10 seconds</div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rides.map((ride) => (
                                <div key={ride.id} className="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-amber-400/20 transition-all">
                                    {/* Ride header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {ride.rider?.profile_pic ? (
                                                <img src={ride.rider.profile_pic} alt="" className="w-10 h-10 rounded-xl" />
                                            ) : (
                                                <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center text-lg">👤</div>
                                            )}
                                            <div>
                                                <div className="text-sm font-bold">{ride.rider?.name || 'Rider'}</div>
                                                <div className="text-[10px] text-neutral-500">
                                                    {ride.rider?.rating ? `⭐ ${ride.rider.rating}` : 'New rider'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-neutral-500 capitalize">{ride.ride_type}</div>
                                            {ride.fare && (
                                                <div className="text-amber-400 font-black text-lg">₹{Math.round(ride.fare)}</div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Locations */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-start gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                                            <div className="text-sm text-neutral-300 line-clamp-1">{ride.pickup_address}</div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-green-400 mt-1.5 flex-shrink-0"></div>
                                            <div className="text-sm text-neutral-300 line-clamp-1">{ride.dropoff_address}</div>
                                        </div>
                                    </div>
                                    {/* Distance & Time */}
                                    {ride.distance && (
                                        <div className="flex items-center gap-4 mb-4 text-xs text-neutral-500">
                                            <span>📏 {ride.distance} km</span>
                                            <span>⏱️ ~{Math.round(ride.distance * 3)} min</span>
                                        </div>
                                    )}
                                    {/* Accept / Decline */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(ride.id)}
                                            disabled={accepting === ride.id}
                                            className="flex-1 bg-amber-400 text-black py-3 rounded-xl font-bold text-sm hover:bg-amber-300 transition active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {accepting === ride.id ? 'Accepting...' : '✓ Accept Ride'}
                                        </button>
                                        <button onClick={() => setRides(rides.filter((r) => r.id !== ride.id))} className="px-4 py-3 bg-white/5 text-neutral-400 border border-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition">
                                            ✕ Skip
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
