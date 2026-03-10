import { useUser } from '@clerk/clerk-react'
import { Link, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getRideById } from '../services/api'
import { useToast } from '../components/Toast'
import emailjs from '@emailjs/browser'

export default function Receipt() {
    const { rideId } = useParams()
    const { user } = useUser()
    const [ride, setRide] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const { addToast } = useToast()
    const receiptRef = useRef(null)

    useEffect(() => {
        async function loadRide() {
            try {
                const data = await getRideById(rideId)
                setRide(data.ride)
            } catch (err) {
                console.error('Load error Ride', err)
            } finally {
                setLoading(false)
            }
        }
        loadRide()
    }, [rideId])

    const handlePrint = () => {
        window.print()
    }

    const handleEmailReceipt = async () => {
        if (!ride || !user) return
        setSending(true)

        try {
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    rider_name: user.fullName || user.firstName,
                    to_email: user.primaryEmailAddress?.emailAddress,
                    ride_id: ride.id.slice(0, 8).toUpperCase(),
                    ride_type: ride.ride_type,
                    pickup: ride.pickup_address,
                    dropoff: ride.dropoff_address,
                    distance: ride.distance ? `${ride.distance}` : 'N/A',
                    fare: Math.round(ride.fare),
                    date: new Date(ride.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                    }),
                    payment_status: ride.status === 'completed' ? 'Paid' : ride.status
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            )
            addToast('📧 Receipt sent to your email!', 'success')
        } catch (err) {
            console.error('email error', err)
            addToast('❌ Failed to send email', 'error')
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center '>
                <div className='text-amber-400 text-lg'>Loading receipt</div>
            </div>
        )
    }

    if (!ride) {
        return (
            <div className='min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white '>
                <div className='text-4xl mb-4'>😕</div>
                <div className='text-lg font-bold mb-2'>Ride Not Found</div>
                <Link to='/history' className='text-amber-400 text-sm hover:underline'>← Back to History</Link>
            </div>
        )
    }

    const rideDate = new Date(ride.created_at)

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Top Bar (hidden on print) */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass print:hidden">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/history" className="text-neutral-400 hover:text-white transition text-sm">← Back</Link>
                    <h1 className="text-base font-bold">Receipt</h1>
                    <div className="w-12"></div>
                </div>
            </nav>
            <div className="max-w-md mx-auto px-4 pt-24 pb-10 print:pt-6">
                {/* Receipt Card */}
                <div ref={receiptRef} className="bg-[#111111] border border-white/5 rounded-3xl p-8 mb-6 print:bg-white print:text-black print:border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <span className="text-black font-black text-xl">C</span>
                        </div>
                        <h2 className="text-xl font-black">CabBooking</h2>
                        <p className="text-neutral-500 text-xs mt-1 print:text-gray-500">Ride Receipt</p>
                    </div>
                    {/* Receipt ID & Date */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 print:border-gray-200">
                        <div>
                            <div className="text-[10px] text-neutral-500 uppercase print:text-gray-500">Receipt #</div>
                            <div className="text-sm font-bold font-mono">{ride.id.slice(0, 8).toUpperCase()}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-neutral-500 uppercase print:text-gray-500">Date</div>
                            <div className="text-sm font-bold">
                                {rideDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                    {/* Route */}
                    <div className="mb-6">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-3 print:text-gray-500">Route</div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-amber-400 mt-1 flex-shrink-0"></div>
                                <div>
                                    <div className="text-[10px] text-neutral-500 uppercase print:text-gray-500">Pickup</div>
                                    <div className="text-sm">{ride.pickup_address}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-sm bg-green-400 mt-1 flex-shrink-0"></div>
                                <div>
                                    <div className="text-[10px] text-neutral-500 uppercase print:text-gray-500">Drop-off</div>
                                    <div className="text-sm">{ride.dropoff_address}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Ride Details */}
                    <div className="mb-6 pb-4 border-b border-white/5 print:border-gray-200">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-3 print:text-gray-500">Details</div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-[10px] text-neutral-500 print:text-gray-500">Ride Type</div>
                                <div className="text-sm font-bold capitalize">{ride.ride_type}</div>
                            </div>
                            {ride.distance && (
                                <div>
                                    <div className="text-[10px] text-neutral-500 print:text-gray-500">Distance</div>
                                    <div className="text-sm font-bold">{ride.distance} km</div>
                                </div>
                            )}
                            <div>
                                <div className="text-[10px] text-neutral-500 print:text-gray-500">Duration</div>
                                <div className="text-sm font-bold">{ride.distance ? `~${Math.round(ride.distance * 3)} min` : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-neutral-500 print:text-gray-500">Status</div>
                                <div className="text-sm font-bold capitalize">{ride.status?.replace('_', ' ')}</div>
                            </div>
                        </div>
                    </div>
                    {/* Driver Info */}
                    {ride.driver && (
                        <div className="mb-6 pb-4 border-b border-white/5 print:border-gray-200">
                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-3 print:text-gray-500">Driver</div>
                            <div className="flex items-center gap-3">
                                {ride.driver.profile_pic ? (
                                    <img src={ride.driver.profile_pic} alt="" className="w-10 h-10 rounded-xl" />
                                ) : (
                                    <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center text-lg">🚗</div>
                                )}
                                <div>
                                    <div className="text-sm font-bold">{ride.driver.name}</div>
                                    {ride.driver.rating && <div className="text-[10px] text-neutral-500">⭐ {ride.driver.rating}</div>}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Total */}
                    <div className="flex items-center justify-between">
                        <div className="text-base font-bold">Total Amount</div>
                        <div className="text-3xl font-black text-amber-400 print:text-amber-600">₹{Math.round(ride.fare)}</div>
                    </div>
                    {/* Footer */}
                    <div className="text-center mt-6 pt-4 border-t border-white/5 print:border-gray-200">
                        <p className="text-[10px] text-neutral-600 print:text-gray-400">Thank you for riding with CabBooking!</p>
                        <p className="text-[10px] text-neutral-600 print:text-gray-400">
                            {rideDate.toLocaleString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        </p>
                    </div>
                </div>
                {/* Action Buttons (hidden on print) */}
                <div className="space-y-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-amber-300 transition-all active:scale-[0.98]"
                    >
                        🖨️ Print / Download PDF
                    </button>
                    <button
                        onClick={handleEmailReceipt}
                        disabled={sending}
                        className="w-full bg-white/5 text-white py-4 rounded-2xl font-bold text-base hover:bg-white/10 transition-all active:scale-[0.98] border border-white/5 disabled:opacity-50"
                    >
                        {sending ? 'Sending...' : '📧 Email Receipt'}
                    </button>
                    <div className="flex gap-3">
                        <Link to="/dashboard" className="flex-1 bg-white/5 text-white py-3 rounded-2xl font-bold text-center text-sm hover:bg-white/10 transition">
                            ← Dashboard
                        </Link>
                        <Link to="/history" className="flex-1 bg-white/5 text-white py-3 rounded-2xl font-bold text-center text-sm hover:bg-white/10 transition">
                            📋 History
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )

}
