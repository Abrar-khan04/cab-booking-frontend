import { useUser, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../services/api'
import BottomNav from '../components/BottomNav'

export default function Profile() {
    const { user } = useUser()
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [role, setRole] = useState('rider')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')


    //Load profile from backend
    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getProfile()
                if (data.user) {
                    setName(data.user.name || '')
                    setPhone(data.user.phone || '')
                    setRole(data.user.role || 'rider')
                }
            } catch (err) {
                console.log('Profile load error:', err.message)
                setName(user?.fullName || '')
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [user])

    //save Profile
    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')
        try {
            await updateProfile({ name, phone, role })
            setMessage('✅ Profile updated successfully!')
        } catch (err) {
            setMessage('❌ Failed to update: ' + err.message)
        } finally {
            setSaving(false)
        }
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-amber-400 text-lg">Loading profile...</div>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Top Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/dashboard" className="flex items-center gap-2 text-neutral-400 hover:text-white transition">
                        ← Back to Dashboard
                    </Link>
                    <UserButton />
                </div>
            </nav>
            <div className="max-w-xl mx-auto px-4 sm:px-6 pt-24 pb-24 md:pb-16">
                <h1 className="text-3xl font-black mb-8">
                    My <span className="text-amber-400">Profile</span>
                </h1>
                {/* Profile Picture */}
                <div className="flex items-center gap-5 mb-10 bg-[#111111] border border-white/5 rounded-2xl p-6">
                    <img
                        src={user?.imageUrl}
                        alt="Profile"
                        className="w-20 h-20 rounded-2xl ring-2 ring-amber-400/30"
                    />
                    <div>
                        <div className="text-lg font-bold">{user?.fullName || name}</div>
                        <div className="text-sm text-neutral-500">{user?.primaryEmailAddress?.emailAddress}</div>
                        <div className="text-xs text-amber-400 mt-1 uppercase font-semibold">{role}</div>
                    </div>
                </div>
                {/* Edit Form */}
                <form onSubmit={handleSave} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#111111] border border-white/5 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-amber-400/30 transition"
                            placeholder="Enter your name"
                        />
                    </div>
                    {/* Phone */}
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-[#111111] border border-white/5 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-amber-400/30 transition"
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
                    {/* Role */}
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">I want to</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('rider')}
                                className={`p-4 rounded-2xl text-center transition-all ${role === 'rider'
                                    ? 'bg-amber-400/10 border-2 border-amber-400/50 text-amber-400'
                                    : 'bg-[#111111] border border-white/5 text-neutral-400 hover:border-white/10'
                                    }`}
                            >
                                <div className="text-2xl mb-1">🚶</div>
                                <div className="text-sm font-bold">Ride</div>
                                <div className="text-[10px] text-neutral-500">Book cabs</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('driver')}
                                className={`p-4 rounded-2xl text-center transition-all ${role === 'driver'
                                    ? 'bg-amber-400/10 border-2 border-amber-400/50 text-amber-400'
                                    : 'bg-[#111111] border border-white/5 text-neutral-400 hover:border-white/10'
                                    }`}
                            >
                                <div className="text-2xl mb-1">🚗</div>
                                <div className="text-sm font-bold">Drive</div>
                                <div className="text-[10px] text-neutral-500">Earn money</div>
                            </button>
                        </div>
                    </div>
                    {/* Message */}
                    {message && (
                        <div className={`p-4 rounded-xl text-sm ${message.startsWith('✅') ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                            {message}
                        </div>
                    )}
                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-amber-300 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>

                {/* Driver Dashboard Link */}
                {role === 'driver' && (
                    <Link
                        to="/driver"
                        className="flex items-center justify-between w-full mt-6 bg-[#111111] border border-amber-400/20 rounded-2xl px-5 py-4 hover:border-amber-400/40 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🚗</span>
                            <div>
                                <div className="text-sm font-bold text-amber-400">Driver Dashboard</div>
                                <div className="text-xs text-neutral-500">View & accept ride requests</div>
                            </div>
                        </div>
                        <span className="text-neutral-600 group-hover:text-amber-400 transition">→</span>
                    </Link>
                )}
            </div>
        </div>
    )
}