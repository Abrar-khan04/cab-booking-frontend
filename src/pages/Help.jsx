import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { createTicket, getMyTickets } from '../services/api'
import { useToast } from '../components/Toast'
import BottomNav from '../components/BottomNav'

const FAQ_DATA = [
    {
        q: 'How do I book a ride?',
        a: 'Go to "Book Ride" from the dashboard, set your pickup and drop-off locations on the map, choose your ride type, and tap "Book". A driver will be assigned to you shortly.',
    },
    {
        q: 'How do I cancel a ride?',
        a: 'On the Ride Status page, tap the "Cancel Ride" button. You\'ll be asked to confirm. Cancellation is free before a driver is assigned.',
    },
    {
        q: 'How do I apply a promo code?',
        a: 'On the Book Ride page, scroll down to the "Promo Code" section, enter your code, and tap "Apply". The discount will be reflected in your fare.',
    },
    {
        q: 'How are fares calculated?',
        a: 'Fares are based on distance and ride type. Bike: ₹8/km, Standard: ₹15/km, Premium: ₹25/km. Each has a base fare and minimum charge.',
    },
    {
        q: 'How do I pay for my ride?',
        a: 'After your ride is completed, tap "Pay Now" on the Ride Status page. Payment is processed securely through Razorpay.',
    },
    {
        q: 'How do I rate my driver?',
        a: 'After ride completion, tap "Rate Your Driver" to leave a 1-5 star rating and optional comment.',
    },
    {
        q: 'What is the SOS feature?',
        a: 'During an active ride, you can access the Emergency SOS section to call 112, share your live location via WhatsApp, or email your location to contacts.',
    },
    {
        q: 'How do I become a driver?',
        a: 'Go to your Profile page and switch your role to "Driver". Then access the Driver Dashboard to start accepting rides.',
    },
]

const CATEGORIES = [
    { id: 'payment', label: '💳 Payment Issue', icon: '💳' },
    { id: 'ride', label: '🚗 Ride Problem', icon: '🚗' },
    { id: 'driver', label: '👤 Driver Issue', icon: '👤' },
    { id: 'account', label: '🔒 Account Help', icon: '🔒' },
    { id: 'lost_item', label: '📦 Lost Item', icon: '📦' },
    { id: 'other', label: '💬 Other', icon: '💬' },
]

export default function Help() {
    const { user } = useUser()
    const { addToast } = useToast()
    const [activeTab, setActiveTab] = useState('faq')
    const [openFaq, setOpenFaq] = useState(null)
    const [tickets, setTickets] = useState([])
    const [loadingTickets, setLoadingTickets] = useState(false)

    // Ticket form state
    const [category, setCategory] = useState('')
    const [subject, setSubject] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Fetch tickets when tab changes
    useEffect(() => {
        if (activeTab === 'tickets') {
            fetchTickets()
        }
    }, [activeTab])

    const fetchTickets = async () => {
        setLoadingTickets(true)
        try {
            const data = await getMyTickets()
            setTickets(data.tickets || [])
        } catch (err) {
            console.error('Fetch tickets error:', err)
        } finally {
            setLoadingTickets(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!category || !subject.trim() || !description.trim()) {
            addToast('Please fill all fields', 'error')
            return
        }
        setSubmitting(true)
        try {
            await createTicket({ category, subject: subject.trim(), description: description.trim() })
            addToast('Ticket submitted! We\'ll get back to you soon.', 'success')
            setCategory('')
            setSubject('')
            setDescription('')
            setActiveTab('tickets')
            fetchTickets()
        } catch (err) {
            addToast('Failed to submit: ' + err.message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const statusColors = {
        open: 'bg-amber-400/20 text-amber-400',
        in_progress: 'bg-blue-400/20 text-blue-400',
        resolved: 'bg-green-400/20 text-green-400',
        closed: 'bg-neutral-400/20 text-neutral-400',
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Top Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/dashboard" className="text-neutral-400 hover:text-white transition text-sm">
                        ← Back
                    </Link>
                    <h1 className="text-base font-bold">Help & Support</h1>
                    <div className="w-12"></div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 pt-24 pb-24 md:pb-10">

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'faq', label: '❓ FAQ' },
                        { id: 'submit', label: '🎫 New Ticket' },
                        { id: 'tickets', label: '📋 My Tickets' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition ${activeTab === tab.id
                                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                                : 'bg-[#111111] text-neutral-500 border border-white/5 hover:border-white/10'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold mb-4">
                            Frequently Asked <span className="text-amber-400">Questions</span>
                        </h2>
                        {FAQ_DATA.map((faq, i) => (
                            <div
                                key={i}
                                className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
                                >
                                    <span className="text-sm font-semibold pr-4">{faq.q}</span>
                                    <span className={`text-amber-400 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                                </button>
                                {openFaq === i && (
                                    <div className="px-4 pb-4 text-sm text-neutral-400 leading-relaxed border-t border-white/5 pt-3">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit Ticket Tab */}
                {activeTab === 'submit' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-lg font-bold mb-4">
                            Submit a <span className="text-amber-400">Ticket</span>
                        </h2>

                        {/* Category */}
                        <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Category</label>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={`flex flex-col items-center p-3 rounded-xl text-xs font-bold transition ${category === cat.id
                                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                                            : 'bg-[#111111] text-neutral-500 border border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <span className="text-lg mb-1">{cat.icon}</span>
                                        {cat.label.split(' ').slice(1).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Brief summary of your issue..."
                                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/40"
                                maxLength={100}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your issue in detail..."
                                rows={4}
                                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/40 resize-none"
                                maxLength={500}
                            />
                            <span className="text-[10px] text-neutral-600 mt-1 block text-right">{description.length}/500</span>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || !category || !subject.trim() || !description.trim()}
                            className="w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-amber-300 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : '📩 Submit Ticket'}
                        </button>
                    </form>
                )}

                {/* My Tickets Tab */}
                {activeTab === 'tickets' && (
                    <div>
                        <h2 className="text-lg font-bold mb-4">
                            My <span className="text-amber-400">Tickets</span>
                        </h2>
                        {loadingTickets ? (
                            <div className="text-center text-neutral-500 py-10">Loading tickets...</div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="text-4xl mb-3">📭</div>
                                <div className="text-neutral-500 text-sm">No tickets yet</div>
                                <button
                                    onClick={() => setActiveTab('submit')}
                                    className="text-amber-400 text-sm mt-2 hover:underline"
                                >
                                    Submit your first ticket →
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="bg-[#111111] border border-white/5 rounded-2xl p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold">{ticket.subject}</h4>
                                                <span className="text-[10px] text-neutral-600 uppercase">{ticket.category}</span>
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${statusColors[ticket.status] || statusColors.open}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-400 mb-2 line-clamp-2">{ticket.description}</p>
                                        <div className="text-[10px] text-neutral-600">
                                            {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}
