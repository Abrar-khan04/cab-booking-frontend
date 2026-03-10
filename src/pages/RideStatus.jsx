import { useUser } from '@clerk/clerk-react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { getRideById, cancelRide } from '../services/api'
import { joinRide, leaveRide, connectSocket } from '../services/socket'
import { useToast } from '../components/Toast'
import ReviewModal from '../components/ReviewModal'
import LiveTrackingMap from '../components/LiveTrackingMap'



export default function RideStatus() {
    const { id } = useParams()
    const { user } = useUser()
    const [ride, setRide] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showReview, setShowReview] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [rideOtp, setRideOtp] = useState(null) // OTP shown to rider when driver arrives
    const { addToast } = useToast()
    const navigate = useNavigate()

    // Check if ride is still active (not completed/cancelled)
    const isActiveRide = ride && !['completed', 'cancelled'].includes(ride.status)

    // Prevent browser back button during active ride
    useEffect(() => {
        if (!isActiveRide) return

        // Push a dummy history entry so back button stays on this page
        window.history.pushState(null, '', window.location.href)

        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href)
            const leave = window.confirm('Your ride is still active! Are you sure you want to leave?')
            if (leave) {
                navigate('/dashboard')
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [isActiveRide, navigate])

    // Warn before closing tab/refreshing during active ride
    useEffect(() => {
        if (!isActiveRide) return
        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isActiveRide])

    // Back button handler with confirmation
    const handleBack = useCallback(() => {
        if (isActiveRide) {
            const leave = window.confirm('Your ride is still active! Are you sure you want to leave this page?')
            if (!leave) return
        }
        navigate('/dashboard')
    }, [isActiveRide, navigate])

    // Load ride details
    const fetchRide = async () => {
        try {
            const data = await getRideById(id)
            setRide(data.ride)
        } catch (err) {
            console.error('Fetch ride error:', err.message)
        } finally {
            setLoading(false)
        }
    }

    // Auto-refresh every 5 seconds (fallback)
    useEffect(() => {
        fetchRide()
        const interval = setInterval(fetchRide, 5000)
        return () => clearInterval(interval)
    }, [id])

    // Real-time socket updates
    useEffect(() => {
        const socket = connectSocket()
        joinRide(id)

        socket.on('ride-status-updated', (data) => {
            if (data.rideId === id) {
                setRide(data.ride)
                const messages = {
                    accepted: '🚗 Driver assigned! They are on the way.',
                    arriving: '📍 Your driver is arriving at pickup!',
                    in_progress: '🚀 Your ride has started. Enjoy!',
                    completed: '🎉 Ride completed! Thanks for riding.',
                    cancelled: '❌ Ride was cancelled.',
                }
                addToast(messages[data.status] || `Status: ${data.status}`, data.status === 'cancelled' ? 'error' : 'success')
            }
        })

        // Rider receives OTP when driver marks 'arriving'
        socket.on('ride-otp', (data) => {
            if (data.rideId === id) {
                setRideOtp(data.otp)
                addToast(`🔐 Your ride OTP: ${data.otp} — Share with driver`, 'warning')
            }
        })

        return () => {
            leaveRide(id)
            socket.off('ride-status-updated')
            socket.off('ride-otp')
        }
    }, [id])

    const statusConfig = {
        requested: { label: 'Finding Driver...', icon: '🔍', color: 'amber', step: 1 },
        accepted: { label: 'Driver Assigned', icon: '✅', color: 'blue', step: 2 },
        arriving: { label: 'Driver Arriving', icon: '🚗', color: 'purple', step: 3 },
        in_progress: { label: 'Ride in Progress', icon: '🚀', color: 'green', step: 4 },
        completed: { label: 'Ride Completed', icon: '🎉', color: 'amber', step: 5 },
        cancelled: { label: 'Ride Cancelled', icon: '❌', color: 'red', step: 0 },
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-amber-400 text-lg">Loading ride status...</div>
            </div>
        )
    }

    const handleCancel = async () => {
        const confirm = window.confirm('Are you sure you want to cancel this ride?')
        if (!confirm) return
        setCancelling(true)
        try {
            await cancelRide(id)
            addToast('Ride cancelled', 'success')
            setRide(prev => ({ ...prev, status: 'cancelled' }))
        } catch (err) {
            addToast('Failed to cancel: ' + err.message, 'error')
        } finally {
            setCancelling(false)
        }
    }

    if (!ride) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
                <div className="text-4xl mb-4">😕</div>
                <div className="text-lg font-bold mb-2">Ride not found</div>
                <Link to="/dashboard" className="text-amber-400 text-sm hover:underline">← Back to Dashboard</Link>
            </div>
        )
    }

    const status = statusConfig[ride.status] || statusConfig.requested

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Top Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <button onClick={handleBack} className="text-neutral-400 hover:text-white transition text-sm">
                        ← Back
                    </button>
                    <h1 className="text-base font-bold">Ride Status</h1>
                    <div className="w-12"></div>
                </div>
            </nav>

            <div className="max-w-xl mx-auto px-4 pt-24 pb-24 md:pb-10">

                {/* Live Tracking Map */}
                {ride.driver_id && !['completed', 'cancelled'].includes(ride.status) && (
                    <LiveTrackingMap ride={ride} />
                )}

                {/* Status Card */}
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 text-center mb-6">
                    <div className="text-5xl mb-4">{status.icon}</div>
                    <h2 className="text-xl font-black mb-2">{status.label}</h2>
                    <p className="text-neutral-500 text-sm">
                        {ride.status === 'requested' && 'Looking for a nearby driver...'}
                        {ride.status === 'accepted' && 'Your driver is on the way to pickup!'}
                        {ride.status === 'arriving' && 'Driver is almost at your location!'}
                        {ride.status === 'in_progress' && 'Enjoy your ride!'}
                        {ride.status === 'completed' && 'Thanks for riding with CabBooking!'}
                        {ride.status === 'cancelled' && 'This ride was cancelled.'}
                    </p>

                    {/* ETA Display */}
                    {ride.distance && !['completed', 'cancelled'].includes(ride.status) && (
                        <div className="mt-4 flex items-center justify-center gap-4">
                            <div className="text-center px-4 py-2 bg-white/5 rounded-xl">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Distance</div>
                                <div className="text-sm font-bold text-white">{ride.distance} km</div>
                            </div>
                            <div className="text-center px-4 py-2 bg-amber-400/10 rounded-xl border border-amber-400/20">
                                <div className="text-[10px] text-amber-400 uppercase tracking-wider">Est. Time</div>
                                <div className="text-sm font-bold text-amber-400">
                                    ~{ride.status === 'in_progress'
                                        ? Math.round(ride.distance * 3)
                                        : Math.round(ride.distance * 3 + 5)} min
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OTP Display for Rider — shown when driver is arriving */}
                    {ride.status === 'arriving' && rideOtp && (
                        <div className="mt-5 bg-purple-500/10 border border-purple-400/30 rounded-2xl p-5">
                            <div className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">🔐 Your Ride OTP</div>
                            <div className="text-xs text-neutral-400 mb-3">Share this code with your driver to start the ride</div>
                            <div className="text-5xl font-black tracking-[0.4em] text-white text-center py-2">{rideOtp}</div>
                        </div>
                    )}


                    {/* Progress steps */}
                    {ride.status !== 'cancelled' && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div key={step} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step <= status.step
                                        ? 'bg-amber-400 text-black'
                                        : 'bg-white/5 text-neutral-600'
                                        }`}>
                                        {step <= status.step ? '✓' : step}
                                    </div>
                                    {step < 5 && (
                                        <div className={`w-6 h-0.5 ${step < status.step ? 'bg-amber-400' : 'bg-white/5'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Driver Info */}
                {ride.driver && (
                    <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 mb-4">
                        <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Your Driver</h3>
                        <div className="flex items-center gap-4">
                            {ride.driver.profile_pic ? (
                                <img src={ride.driver.profile_pic} alt="" className="w-14 h-14 rounded-2xl ring-2 ring-amber-400/30" />
                            ) : (
                                <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center text-2xl">🚗</div>
                            )}
                            <div className="flex-1">
                                <div className="font-bold text-base">{ride.driver.name}</div>
                                <div className="text-xs text-neutral-500">
                                    {ride.driver.rating ? `⭐ ${ride.driver.rating} rating` : 'New driver'}
                                </div>
                            </div>
                            <a href={`tel:${ride.driver.phone || ''}`} className="w-11 h-11 bg-green-400/10 rounded-xl flex items-center justify-center text-lg hover:bg-green-400/20 transition">
                                📞
                            </a>
                        </div>
                    </div>
                )}

                {/* Ride Details */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 mb-4">
                    <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Ride Details</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-full bg-amber-400 mt-1 flex-shrink-0"></div>
                            <div>
                                <div className="text-[10px] text-neutral-500 uppercase">Pickup</div>
                                <div className="text-sm">{ride.pickup_address}</div>
                            </div>
                        </div>
                        {/* Stops */}
                        {ride.stops && ride.stops.length > 0 && ride.stops.map((stop, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-orange-400 mt-1 flex-shrink-0"></div>
                                <div>
                                    <div className="text-[10px] text-neutral-500 uppercase">Stop {i + 1}</div>
                                    <div className="text-sm">{stop.address}</div>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-start gap-3">
                            <div className="w-3 h-3 rounded-sm bg-green-400 mt-1 flex-shrink-0"></div>
                            <div>
                                <div className="text-[10px] text-neutral-500 uppercase">Drop-off</div>
                                <div className="text-sm">{ride.dropoff_address}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fare */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-neutral-500 uppercase tracking-wider">Estimated Fare</div>
                            <div className="text-2xl font-black text-amber-400 mt-1">₹{ride.fare ? Math.round(ride.fare) : '--'}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-neutral-500 uppercase tracking-wider">Ride Type</div>
                            <div className="text-base font-bold capitalize mt-1">{ride.ride_type}</div>
                        </div>
                    </div>
                    {ride.distance && (
                        <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-neutral-500">
                            <span>📏 {ride.distance} km</span>
                            <span>⏱️ ~{Math.round(ride.distance * 3)} min</span>
                        </div>
                    )}
                </div>

                {/* Pay Button (after ride completed) */}
                {ride.status === 'completed' && (
                    <Link
                        to={`/payment/${ride.id}`}
                        className="block w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-center text-base hover:bg-amber-300 transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-amber-400/20 mb-3"
                    >
                        💳 Pay ₹{Math.round(ride.fare)} Now
                    </Link>
                )}

                {ride.status === 'completed' && (
                    <Link
                        to={`/receipt/${ride.id}`}
                        className="block w-full bg-white/5 text-white py-3 rounded-2xl font-bold text-center text-sm hover:bg-white/10 transition border border-white/5 mb-3"
                    >
                        🧾 View Receipt
                    </Link>
                )}

                {/* Rate Driver Button */}
                {ride.status === 'completed' && ride.driver_id && (
                    <button
                        onClick={() => setShowReview(true)}
                        className="block w-full bg-white/5 text-white py-3 rounded-2xl font-bold text-center text-sm hover:bg-white/10 transition border border-white/5 mb-3"
                    >
                        ⭐ Rate Your Driver
                    </button>
                )}

                {/* Driver Profile Link */}
                {ride.driver_id && (
                    <Link
                        to={`/driver-profile/${ride.driver_id}`}
                        className="block w-full text-center text-amber-400 text-xs hover:underline mb-3"
                    >
                        View Driver Reviews →
                    </Link>
                )}

                {/* Cancel Ride Button */}
                {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                    <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="block w-full bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-2xl font-bold text-center text-sm hover:bg-red-500/20 transition mb-3 disabled:opacity-50"
                    >
                        {cancelling ? '⏳ Cancelling...' : '❌ Cancel Ride'}
                    </button>
                )}

                {/* 🚨 Emergency SOS */}
                {ride.status !== 'completed' && ride.status !== 'cancelled' && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mb-3">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-red-400">🚨 Emergency SOS</h3>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {/* Call 112 */}
                            <a
                                href="tel:112"
                                className="flex flex-col items-center gap-1 bg-red-500/10 hover:bg-red-500/20 py-3 rounded-xl transition"
                            >
                                <span className="text-xl">📞</span>
                                <span className="text-[10px] text-red-300 font-bold">Call 112</span>
                            </a>
                            {/* Share location via WhatsApp */}
                            <button
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((pos) => {
                                            const { latitude, longitude } = pos.coords
                                            const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`
                                            const msg = `🚨 EMERGENCY! I need help! My current location: ${mapLink} (Ride ID: ${ride.id})`
                                            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                                        }, () => {
                                            const msg = `🚨 EMERGENCY! I need help during my cab ride! Ride ID: ${ride.id}, Pickup: ${ride.pickup_address}`
                                            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
                                        })
                                    }
                                }}
                                className="flex flex-col items-center gap-1 bg-red-500/10 hover:bg-red-500/20 py-3 rounded-xl transition"
                            >
                                <span className="text-xl">💬</span>
                                <span className="text-[10px] text-red-300 font-bold">WhatsApp</span>
                            </button>
                            {/* Share via Email */}
                            <button
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((pos) => {
                                            const { latitude, longitude } = pos.coords
                                            const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`
                                            const subject = '🚨 Emergency SOS - Cab Ride'
                                            const body = `EMERGENCY! I need help!\n\nMy live location: ${mapLink}\nRide ID: ${ride.id}\nPickup: ${ride.pickup_address}\nDrop-off: ${ride.dropoff_address}\nDriver: ${ride.driver?.name || 'Not assigned'}`
                                            window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
                                        }, () => {
                                            const subject = '🚨 Emergency SOS - Cab Ride'
                                            const body = `EMERGENCY! I need help!\n\nRide ID: ${ride.id}\nPickup: ${ride.pickup_address}\nDrop-off: ${ride.dropoff_address}`
                                            window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
                                        })
                                    }
                                }}
                                className="flex flex-col items-center gap-1 bg-red-500/10 hover:bg-red-500/20 py-3 rounded-xl transition"
                            >
                                <span className="text-xl">📧</span>
                                <span className="text-[10px] text-red-300 font-bold">Email</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-neutral-600 mt-2 text-center">Shares your live location with contacts</p>
                    </div>
                )}
                <div className="flex gap-3 mt-6">
                    <Link to="/dashboard" className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-bold text-center text-sm hover:bg-white/10 transition">
                        ← Dashboard
                    </Link>
                    <Link to="/history" className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-bold text-center text-sm hover:bg-white/10 transition">
                        📋 Ride History
                    </Link>
                </div>
            </div>

            {/* Review Modal */}
            {showReview && (
                <ReviewModal
                    ride={ride}
                    onClose={() => setShowReview(false)}
                    onReviewSubmitted={() => setShowReview(false)}
                />
            )}
        </div>
    )
}
