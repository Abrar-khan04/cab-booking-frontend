import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getUserRides } from '../services/api'
import BottomNav from '../components/BottomNav'

export default function RideHistory() {
    const { user } = useUser()
    const [rides, setRides] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadRides() {
            try {
                const data = await getUserRides()
                setRides(data.rides || [])
            } catch (err) {
                console.error('Load rides error:', err.message)
            } finally {
                setLoading(false)
            }
        }
        loadRides()
    }, [])

    const statusColors = {
        requested: 'text-yellow-400 bg-yellow-400/10',
        accepted: 'text-blue-400 bg-blue-400/10',
        arriving: 'text-purple-400 bg-purple-400/10',
        in_progress: 'text-green-400 bg-green-400/10',
        completed: 'text-neutral-400 bg-neutral-400/10',
        cancelled: 'text-red-400 bg-red-400/10',
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/dashboard" className="text-neutral-400 hover:text-white transition text-sm">← Back</Link>
                    <h1 className="text-base font-bold">Ride History</h1>
                    <div className="w-12"></div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 pt-24 pb-24 md:pb-10">
                <h1 className="text-2xl font-black mb-6">
                    Your <span className="text-amber-400">Rides</span>
                </h1>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="text-amber-400 text-lg">Loading rides...</div>
                    </div>
                ) : rides.length === 0 ? (
                    <div className="text-center py-16 bg-[#111111] border border-white/5 rounded-2xl">
                        <div className="text-4xl mb-3">🚗</div>
                        <div className="text-neutral-400 font-semibold mb-1">No rides yet</div>
                        <div className="text-neutral-600 text-sm">Book your first ride to see it here!</div>
                        <Link to="/book-ride" className="inline-block mt-4 bg-amber-400 text-black px-6 py-2 rounded-xl font-bold text-sm hover:bg-amber-300 transition">
                            Book a Ride
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rides.map((ride) => (
                            <Link key={ride.id} to={`/ride/${ride.id}`} className="block bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-amber-400/20 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{ride.ride_type === 'bike' ? '🏍️' : ride.ride_type === 'premium' ? '✨' : '🚗'}</span>
                                        <span className="text-sm font-bold capitalize">{ride.ride_type}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {ride.fare && (
                                            <span className="text-amber-400 font-black">₹{Math.round(ride.fare)}</span>
                                        )}
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${statusColors[ride.status] || ''}`}>
                                            {ride.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                                        <div className="text-sm text-neutral-300 line-clamp-1">{ride.pickup_address}</div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-sm bg-green-400 mt-1.5 flex-shrink-0"></div>
                                        <div className="text-sm text-neutral-300 line-clamp-1">{ride.dropoff_address}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-neutral-500">
                                    {ride.distance && <span>📏 {ride.distance} km</span>}
                                    <span>📅 {new Date(ride.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    {ride.status === 'completed' && (
                                        <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/receipt/${ride.id}` }} className="ml-auto text-amber-400 font-semibold hover:underline cursor-pointer">
                                            🧾 Receipt
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    )
}
