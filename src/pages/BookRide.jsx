import { useUser } from '@clerk/clerk-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import MapPicker from '../components/MapPicker'
import LocationSearch from '../components/LocationSearch'
import { createRide, validatePromoCode, getProfile } from '../services/api'

export default function BookRide() {
    const { user } = useUser()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [pickup, setPickup] = useState(null)
    const [dropoff, setDropoff] = useState(null)
    const [selectingMode, setSelectingMode] = useState('pickup')
    const [rideType, setRideType] = useState('standard')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [stops, setStops] = useState([])
    const [promoCode, setPromoCode] = useState('')
    const [promoDiscount, setPromoDiscount] = useState(null)
    const [promoLoading, setPromoLoading] = useState(false)
    const [promoError, setPromoError] = useState('')
    const [userRole, setUserRole] = useState(null)

    // Pre-fill from Dashboard quick-book URL params
    useEffect(() => {
        const pickupText = searchParams.get('pickup')
        const dropoffText = searchParams.get('dropoff')
        if (pickupText) setPickup({ name: pickupText, address: pickupText })
        if (dropoffText) setDropoff({ name: dropoffText, address: dropoffText })
    }, [])

    // Check user role on mount
    useEffect(() => {
        getProfile().then(data => {
            setUserRole(data?.user?.role || 'rider')
        }).catch(() => setUserRole('rider'))
    }, [])

    // Block if user is in Driver mode
    if (userRole === 'driver') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
                <div className="text-center max-w-sm">
                    <div className="text-6xl mb-6">🚗</div>
                    <h2 className="text-2xl font-black mb-3">
                        You're in <span className="text-amber-400">Driver Mode</span>
                    </h2>
                    <p className="text-neutral-400 text-sm mb-8">
                        To book a ride, switch your account to Rider mode first. You cannot be a driver and a rider at the same time.
                    </p>
                    <Link
                        to="/profile"
                        className="inline-block bg-amber-400 text-black px-8 py-3 rounded-2xl font-bold hover:bg-amber-300 transition"
                    >
                        Switch to Rider Mode →
                    </Link>
                    <div className="mt-4">
                        <Link to="/dashboard" className="text-neutral-500 text-sm hover:text-white transition">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }


    // Calculate estimated fare (frontend estimate)
    const calculateEstimate = () => {
        if (!pickup || !dropoff) return null

        // Build the full route: pickup → stops → dropoff
        const points = [pickup, ...stops.filter(Boolean), dropoff]

        let totalDistance = 0
        for (let i = 0; i < points.length - 1; i++) {
            const R = 6371
            const dLat = ((points[i + 1].lat - points[i].lat) * Math.PI) / 180
            const dLng = ((points[i + 1].lng - points[i].lng) * Math.PI) / 180
            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((points[i].lat * Math.PI) / 180) *
                Math.cos((points[i + 1].lat * Math.PI) / 180) *
                Math.sin(dLng / 2) ** 2
            totalDistance += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        }

        const rates = {
            bike: { base: 20, perKm: 8, min: 30 },
            standard: { base: 50, perKm: 15, min: 80 },
            premium: { base: 100, perKm: 25, min: 150 },
        }
        const rate = rates[rideType]
        const fare = Math.max(rate.base + totalDistance * rate.perKm, rate.min)
        return { distance: totalDistance.toFixed(1), fare: Math.round(fare), stopCount: stops.filter(Boolean).length }
    }


    const estimate = calculateEstimate()




    const addStop = () => {
        if (stops.length >= 3) return // max 3 stops
        setStops([...stops, null])
    }

    const removeStop = (index) => {
        setStops(stops.filter((_, i) => i !== index))
    }

    const updateStop = (index, location) => {
        const updated = [...stops]
        updated[index] = location
        setStops(updated)
    }



    // Apply promo code
    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return
        setPromoLoading(true)
        setPromoError('')
        try {
            const data = await validatePromoCode(promoCode.trim())
            setPromoDiscount(data)
            setPromoError('')
        } catch (err) {
            setPromoDiscount(null)
            setPromoError(err.message || 'Invalid promo code')
        } finally {
            setPromoLoading(false)
        }
    }

    // Calculate discounted fare
    const getDiscountedFare = () => {
        if (!estimate || !promoDiscount) return null
        let discount = 0
        if (promoDiscount.discount_type === 'percentage') {
            discount = (estimate.fare * promoDiscount.discount_value) / 100
            if (promoDiscount.max_discount) {
                discount = Math.min(discount, promoDiscount.max_discount)
            }
        } else {
            discount = promoDiscount.discount_value
        }
        return {
            discount: Math.round(discount),
            finalFare: Math.max(Math.round(estimate.fare - discount), 0),
        }
    }

    const discounted = getDiscountedFare()

    // Submit ride request
    const handleBookRide = async () => {
        if (!pickup || !dropoff) {
            setError('Please set both pickup and drop-off locations')
            return
        }

        setLoading(true)
        setError('')
        try {
            const data = await createRide({
                pickup_address: pickup.address,
                pickup_lat: pickup.lat,
                pickup_lng: pickup.lng,
                dropoff_address: dropoff.address,
                dropoff_lat: dropoff.lat,
                dropoff_lng: dropoff.lng,
                ride_type: rideType,
                stops: stops.filter(Boolean).map(s => ({
                    address: s.address || s.name,
                    lat: s.lat,
                    lng: s.lng,
                })),
                promo_code: promoDiscount ? promoDiscount.code : null,
                discount: discounted ? discounted.discount : 0,
            })
            alert('🎉 Ride requested! Waiting for driver...')
            navigate(`/ride/${data.ride.id}`)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Top Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/dashboard" className="text-neutral-400 hover:text-white transition text-sm">
                        ← Back
                    </Link>
                    <h1 className="text-base font-bold">Book a Ride</h1>
                    <div className="w-12"></div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 pt-24 pb-24 md:pb-10">

                {/* MAP */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
                            {selectingMode === 'pickup' ? '📍 Tap map to set Pickup' : '📍 Tap map to set Drop-off'}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectingMode('pickup')}
                                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${selectingMode === 'pickup'
                                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                                    : 'bg-white/5 text-neutral-500 border border-white/5'
                                    }`}
                            >
                                Pickup
                            </button>
                            <button
                                onClick={() => setSelectingMode('dropoff')}
                                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${selectingMode === 'dropoff'
                                    ? 'bg-green-400/20 text-green-400 border border-green-400/40'
                                    : 'bg-white/5 text-neutral-500 border border-white/5'
                                    }`}
                            >
                                Drop-off
                            </button>
                        </div>
                    </div>
                    <MapPicker
                        pickup={pickup}
                        dropoff={dropoff}
                        stops={stops}
                        onPickupSet={setPickup}
                        onDropoffSet={setDropoff}
                        selectingMode={selectingMode}
                    />
                </div>

                {/* LOCATION SEARCH */}
                <div className="space-y-3 mb-6">
                    <div onClick={() => setSelectingMode('pickup')}>
                        <LocationSearch
                            label="Enter pickup location..."
                            value={pickup?.address || ''}
                            onChange={setPickup}
                            icon="●"
                            iconColor="bg-amber-400 shadow-amber-400/40"
                        />
                    </div>
                    <div onClick={() => setSelectingMode('dropoff')}>
                        <LocationSearch
                            label="Where are you going?"
                            value={dropoff?.address || ''}
                            onChange={setDropoff}
                            icon="■"
                            iconColor="bg-green-400 shadow-green-400/40"
                        />
                    </div>
                </div>

                {/* MULTI-STOP SECTION */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
                            🛑 Stops ({stops.filter(Boolean).length}/{stops.length > 0 ? stops.length : 0} added, max 3)
                        </h2>
                        {stops.length < 3 && (
                            <button
                                onClick={addStop}
                                className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-amber-400/20 text-amber-400 border border-amber-400/40 hover:bg-amber-400/30 transition"
                            >
                                + Add Stop
                            </button>
                        )}
                    </div>
                    {stops.map((stop, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-orange-400 shadow-md shadow-orange-400/40 shrink-0"></div>
                            <div className="flex-1">
                                <LocationSearch
                                    label={`Stop ${index + 1} location...`}
                                    value={stop?.address || ''}
                                    onChange={(loc) => updateStop(index, loc)}
                                    icon="●"
                                    iconColor="bg-orange-400 shadow-orange-400/40"
                                />
                            </div>
                            <button
                                onClick={() => removeStop(index)}
                                className="text-red-400 text-sm px-2 py-2 rounded-lg hover:bg-red-400/10 transition shrink-0"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {stops.length === 0 && (
                        <p className="text-xs text-neutral-600">Add up to 3 intermediate stops for your ride</p>
                    )}
                </div>

                {/* RIDE TYPE */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Choose Ride</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'bike', icon: '🏍️', name: 'Bike', price: '₹8/km' },
                            { id: 'standard', icon: '🚗', name: 'Standard', price: '₹15/km' },
                            { id: 'premium', icon: '✨', name: 'Premium', price: '₹25/km' },
                        ].map((ride) => (
                            <button
                                key={ride.id}
                                onClick={() => setRideType(ride.id)}
                                className={`flex flex-col items-center p-4 rounded-2xl transition-all active:scale-95 ${rideType === ride.id
                                    ? 'bg-amber-400/10 border-2 border-amber-400/50'
                                    : 'bg-[#111111] border border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <span className="text-2xl mb-2">{ride.icon}</span>
                                <span className={`text-sm font-bold ${rideType === ride.id ? 'text-amber-400' : 'text-white'}`}>{ride.name}</span>
                                <span className="text-[10px] text-neutral-500 mt-1">{ride.price}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ESTIMATE */}
                {estimate && (
                    <div className="bg-[#111111] border border-amber-400/20 rounded-2xl p-5 mb-6">
                        <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Ride Estimate</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-neutral-400 text-sm">Distance: </span>
                                <span className="text-white font-bold">{estimate.distance} km</span>
                                {estimate.stopCount > 0 && (
                                    <span className="text-orange-400 text-xs ml-2">({estimate.stopCount} stop{estimate.stopCount > 1 ? 's' : ''})</span>
                                )}
                            </div>
                            <div>
                                <span className="text-neutral-400 text-sm">Fare: </span>
                                <span className="text-amber-400 text-2xl font-black">₹{estimate.fare}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* PROMO CODE */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">🎟️ Promo Code</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="Enter code..."
                            disabled={!!promoDiscount}
                            className="flex-1 bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/40 uppercase disabled:opacity-50"
                        />
                        {promoDiscount ? (
                            <button
                                onClick={() => { setPromoDiscount(null); setPromoCode(''); setPromoError('') }}
                                className="px-4 py-3 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                            >
                                Remove
                            </button>
                        ) : (
                            <button
                                onClick={handleApplyPromo}
                                disabled={promoLoading || !promoCode.trim()}
                                className="px-5 py-3 rounded-xl text-sm font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40 hover:bg-amber-400/30 transition disabled:opacity-40"
                            >
                                {promoLoading ? '...' : 'Apply'}
                            </button>
                        )}
                    </div>
                    {promoError && <p className="text-red-400 text-xs mt-2">{promoError}</p>}
                    {promoDiscount && (
                        <div className="mt-2 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2 flex items-center justify-between">
                            <span className="text-green-400 text-sm font-bold">✅ {promoDiscount.code} applied!</span>
                            <span className="text-green-400 text-xs">
                                {promoDiscount.discount_type === 'percentage'
                                    ? `${promoDiscount.discount_value}% off`
                                    : `₹${promoDiscount.discount_value} off`
                                }
                            </span>
                        </div>
                    )}
                </div>

                {/* DISCOUNTED FARE */}
                {discounted && estimate && (
                    <div className="bg-green-400/5 border border-green-400/20 rounded-2xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-neutral-400 text-sm">Original: </span>
                                <span className="text-neutral-500 line-through">₹{estimate.fare}</span>
                                <span className="text-green-400 text-xs ml-2">-₹{discounted.discount}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 text-sm">You pay: </span>
                                <span className="text-green-400 text-2xl font-black">₹{discounted.finalFare}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="bg-red-400/10 text-red-400 p-4 rounded-xl text-sm mb-4">
                        {error}
                    </div>
                )}

                {/* BOOK BUTTON */}
                <button
                    onClick={handleBookRide}
                    disabled={loading || !pickup || !dropoff}
                    className="w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-amber-300 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-400/20"
                >
                    {loading ? 'Requesting Ride...' : `Book ${rideType.charAt(0).toUpperCase() + rideType.slice(1)} — ${discounted ? `₹${discounted.finalFare}` : estimate ? `₹${estimate.fare}` : 'Select locations'}`}
                </button>
            </div>
        </div>
    )
}
