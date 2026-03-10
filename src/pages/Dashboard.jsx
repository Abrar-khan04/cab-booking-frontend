import { UserButton, useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import BottomNav from '../components/BottomNav'

export default function Dashboard() {
    const { user } = useUser()
    const navigate = useNavigate()
    const [pickup, setPickup] = useState('')
    const [dropoff, setDropoff] = useState('')

    const handleQuickBook = () => {
        const params = new URLSearchParams()
        if (pickup.trim()) params.set('pickup', pickup.trim())
        if (dropoff.trim()) params.set('dropoff', dropoff.trim())
        navigate(`/book-ride${params.toString() ? '?' + params.toString() : ''}`)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-24 md:pb-10">

            {/* ========== TOP BAR ========== */}
            <div className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center">
                            <span className="text-black font-black text-base">C</span>
                        </div>
                        <span className="text-lg font-bold hidden sm:block">
                            <span className="text-amber-400">Cab</span>Booking
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1 mr-2">
                            {['Dashboard', 'Rides', 'Wallet'].map((item) => (
                                <button key={item} className="px-4 py-2 text-sm text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition">
                                    {item}
                                </button>
                            ))}
                        </div>
                        <span className="text-sm text-neutral-400 hidden sm:block">
                            {user?.firstName}
                        </span>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9 ring-2 ring-amber-400/30"
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ========== MAIN CONTENT ========== */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-24 md:pb-10">

                {/* Welcome Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                    <div>
                        <p className="text-neutral-500 text-sm mb-1">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋</p>
                        <h1 className="text-2xl md:text-3xl font-black">
                            <span className="text-amber-400">{user?.firstName}</span> {user?.lastName}
                        </h1>
                        <Link to="/profile" className="text-xs text-amber-400 hover:underline mt-1 inline-block">Edit Profile</Link>
                        <span className="text-neutral-600 mx-2 hidden sm:inline">·</span>
                        <Link to="/driver" className="text-xs text-neutral-500 hover:text-amber-400 hover:underline mt-1 inline-block">🚗 Driver Mode</Link>
                        <span className="text-neutral-600 mx-2 hidden sm:inline">·</span>
                        <Link to="/history" className="text-xs text-neutral-500 hover:text-amber-400 hover:underline mt-1 inline-block">📋 Ride History</Link>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-xs text-neutral-400">Online</span>
                    </div>
                </div>

                {/* ========== QUICK BOOK ========== */}
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-xl">🚕</span> Book a Ride
                        </h2>
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Quick Book</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Pickup */}
                        <div className="relative cursor-pointer" onClick={() => navigate(`/book-ride${pickup ? `?pickup=${encodeURIComponent(pickup)}` : ''}`)}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-md shadow-amber-400/40"></div>
                            <input
                                type="text"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                                onFocus={() => navigate(`/book-ride${pickup ? `?pickup=${encodeURIComponent(pickup)}` : ''}`)}
                                placeholder="Enter pickup location..."
                                readOnly
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl pl-10 pr-4 py-4 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-amber-400/30 transition cursor-pointer hover:border-amber-400/20"
                            />
                        </div>

                        {/* Drop-off */}
                        <div className="relative cursor-pointer" onClick={() => navigate(`/book-ride${dropoff ? `?dropoff=${encodeURIComponent(dropoff)}` : ''}`)}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-400 rounded-sm shadow-md shadow-green-400/40"></div>
                            <input
                                type="text"
                                value={dropoff}
                                onChange={(e) => setDropoff(e.target.value)}
                                onFocus={() => navigate(`/book-ride${dropoff ? `?dropoff=${encodeURIComponent(dropoff)}` : ''}`)}
                                placeholder="Where are you going?"
                                readOnly
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl pl-10 pr-4 py-4 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-green-400/20 transition cursor-pointer hover:border-green-400/20"
                            />
                        </div>
                    </div>

                    {/* Ride Types */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { icon: '🏍️', name: 'Bike', price: '₹49', time: '5 min', selected: false },
                            { icon: '🚗', name: 'Standard', price: '₹149', time: '8 min', selected: true },
                            { icon: '✨', name: 'Premium', price: '₹299', time: '6 min', selected: false },
                        ].map((ride) => (
                            <button
                                key={ride.name}
                                className={`flex flex-col items-center p-4 rounded-2xl transition-all active:scale-95 ${ride.selected
                                    ? 'bg-amber-400/10 border-2 border-amber-400/50'
                                    : 'bg-[#1a1a1a] border border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <span className="text-2xl mb-2">{ride.icon}</span>
                                <span className={`text-sm font-bold ${ride.selected ? 'text-amber-400' : 'text-white'}`}>{ride.name}</span>
                                <span className="text-[10px] text-neutral-500 mt-1">{ride.price} · {ride.time}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleQuickBook}
                        className="block w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-amber-300 transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-amber-400/20 text-center"
                    >
                        Find Drivers →
                    </button>
                </div>

                {/* ========== STATS ROW ========== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { icon: '🚗', label: 'Total Rides', value: '12', change: '+3 this week' },
                        { icon: '💰', label: 'Wallet', value: '₹2,450', change: 'Add money' },
                        { icon: '⭐', label: 'Your Rating', value: '4.8', change: 'Excellent' },
                        { icon: '🎁', label: 'Rewards', value: '350', change: 'Points earned' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#111111] border border-white/5 rounded-2xl p-5 group hover:border-amber-400/20 transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xl">{stat.icon}</span>
                                <span className="text-[10px] text-neutral-600 uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <div className="text-2xl font-black group-hover:text-amber-400 transition">{stat.value}</div>
                            <div className="text-[10px] text-neutral-500 mt-1">{stat.change}</div>
                        </div>
                    ))}
                </div>

                {/* ========== SAVED PLACES ========== */}
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 mb-6">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                        <span>📍</span> Saved Places
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { icon: '🏠', name: 'Home', address: '123 Main Street, City', color: 'amber' },
                            { icon: '🏢', name: 'Office', address: '456 Business Park, City', color: 'blue' },
                            { icon: '⭐', name: 'Favorite', address: 'Add a favorite place', color: 'gray' },
                        ].map((place, i) => (
                            <button key={i} className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl hover:border-amber-400/20 transition-all text-left active:scale-[0.98]">
                                <div className="w-11 h-11 bg-amber-400/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                                    {place.icon}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-sm font-semibold">{place.name}</div>
                                    <div className="text-xs text-neutral-500 truncate">{place.address}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ========== QUICK ACTIONS ========== */}
                <div className="mb-6">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                        <span>⚡</span> Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: '📜', title: 'Ride History', desc: 'View past rides', link: '/history' },
                            { icon: '💳', title: 'Payments', desc: 'Payment history', link: '/history' },
                            { icon: '🛡️', title: 'Safety', desc: 'SOS & sharing', link: null },
                            { icon: '🎫', title: 'Offers', desc: 'Promo codes', link: null },
                            { icon: '👤', title: 'Profile', desc: 'Edit details', link: '/profile' },
                            { icon: '⚙️', title: 'Settings', desc: 'Preferences', link: '/profile' },
                            { icon: '❓', title: 'Help', desc: '24/7 support', link: null },
                            { icon: '📊', title: 'Activity', desc: 'Ride stats', link: '/history' },
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => action.link ? navigate(action.link) : alert(`${action.title} coming soon!`)}
                                className="group bg-[#111111] border border-white/5 rounded-2xl p-5 text-left hover:border-amber-400/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                <div className="w-11 h-11 bg-amber-400/10 rounded-xl flex items-center justify-center text-xl mb-3 group-hover:bg-amber-400/20 transition">
                                    {action.icon}
                                </div>
                                <div className="text-sm font-bold group-hover:text-amber-400 transition">{action.title}</div>
                                <div className="text-[11px] text-neutral-500 mt-0.5">{action.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ========== RECENT RIDES ========== */}
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold flex items-center gap-2">
                            <span>🕐</span> Recent Rides
                        </h2>
                        <button onClick={() => navigate('/history')} className="text-xs text-amber-400 font-semibold hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        {[
                            { from: 'MG Road Metro', to: 'Indiranagar', date: 'Today, 2:30 PM', price: '₹185', status: 'Completed', statusColor: 'green' },
                            { from: 'Home', to: 'Office Park', date: 'Yesterday, 9:15 AM', price: '₹120', status: 'Completed', statusColor: 'green' },
                            { from: 'Airport T2', to: 'Downtown Hotel', date: 'Feb 28, 11:00 PM', price: '₹450', status: 'Completed', statusColor: 'green' },
                        ].map((ride, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-2xl hover:bg-[#1e1e1e] transition cursor-pointer">
                                <div className="w-11 h-11 bg-amber-400/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                                    🚗
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <span className="truncate">{ride.from}</span>
                                        <span className="text-amber-400 text-xs">→</span>
                                        <span className="truncate">{ride.to}</span>
                                    </div>
                                    <div className="text-[11px] text-neutral-500 mt-0.5">{ride.date}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-sm font-bold">{ride.price}</div>
                                    <div className={`text-[10px] font-medium text-${ride.statusColor}-400`}>{ride.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Mobile Bottom Nav */}
            <BottomNav />
        </div>
    )
}
