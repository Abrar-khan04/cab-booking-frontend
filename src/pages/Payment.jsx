import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { createPayment, confirmPayment, getRideById } from '../services/api'
import { useToast } from '../components/Toast'

export default function Payment() {
    const { rideId } = useParams()
    const navigate = useNavigate()
    const [ride, setRide] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [paid, setPaid] = useState(false)
    const [error, setError] = useState('')
    const { addToast } = useToast()

    // Payment data from backend
    const [paymentData, setPaymentData] = useState(null)

    useEffect(() => {
        async function init() {
            try {
                // Load ride details
                const rideRes = await getRideById(rideId)
                setRide(rideRes.ride)

                // Create Razorpay order
                const payRes = await createPayment(rideId)
                setPaymentData(payRes)
            } catch (err) {
                console.error('Payment init error:', err.message)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [rideId])

    // Open Razorpay checkout
    const handlePay = () => {
        if (!paymentData) return
        setProcessing(true)
        setError('')

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: paymentData.amount,
            currency: paymentData.currency || 'INR',
            order_id: paymentData.orderId,
            name: 'CabBooking',
            description: `Ride Payment — ${ride?.ride_type || 'standard'}`,
            image: '', // optional logo
            handler: async function (response) {
                // Payment successful — verify on backend
                try {
                    await confirmPayment(
                        paymentData.payment.id,
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    )
                    setPaid(true)
                    addToast('💳 Payment successful!', 'success')
                } catch (err) {
                    setError('Payment verification failed: ' + err.message)
                    addToast('❌ Payment verification failed', 'error')
                } finally {
                    setProcessing(false)
                }
            },
            prefill: {
                name: '',
                email: '',
                contact: '',
            },
            theme: {
                color: '#f59e0b',
                backdrop_color: 'rgba(0,0,0,0.8)',
            },
            modal: {
                ondismiss: function () {
                    setProcessing(false)
                },
            },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response) {
            setError(response.error.description || 'Payment failed')
            setProcessing(false)
        })
        rzp.open()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-amber-400 text-lg">Setting up payment...</div>
            </div>
        )
    }

    if (paid) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-6">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-black mb-2">Payment Successful!</h1>
                <p className="text-neutral-500 text-sm mb-8">Your ride has been paid for. Thank you!</p>
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 w-full max-w-sm mb-8">
                    <div className="flex justify-between mb-3">
                        <span className="text-neutral-500 text-sm">Amount</span>
                        <span className="text-amber-400 font-black text-lg">₹{Math.round(ride?.fare || 0)}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                        <span className="text-neutral-500 text-sm">Ride Type</span>
                        <span className="text-white text-sm capitalize">{ride?.ride_type}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-500 text-sm">Status</span>
                        <span className="text-green-400 text-sm font-semibold">Paid ✓</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to="/dashboard" className="bg-amber-400 text-black px-8 py-3 rounded-2xl font-bold hover:bg-amber-300 transition">
                        Dashboard
                    </Link>
                    <Link to="/history" className="bg-white/5 text-white px-8 py-3 rounded-2xl font-bold hover:bg-white/10 transition">
                        Ride History
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to={`/ride/${rideId}`} className="text-neutral-400 hover:text-white transition text-sm">← Back</Link>
                    <h1 className="text-base font-bold">Payment</h1>
                    <div className="w-12"></div>
                </div>
            </nav>

            <div className="max-w-md mx-auto px-4 pt-24 pb-10">
                {/* Ride Summary */}
                {ride && (
                    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 mb-6">
                        <h2 className="text-xs text-neutral-500 uppercase tracking-wider mb-4">Ride Summary</h2>
                        <div className="space-y-3 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-amber-400 mt-1 flex-shrink-0"></div>
                                <div className="text-sm text-neutral-300 line-clamp-1">{ride.pickup_address}</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-3 h-3 rounded-sm bg-green-400 mt-1 flex-shrink-0"></div>
                                <div className="text-sm text-neutral-300 line-clamp-1">{ride.dropoff_address}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div>
                                <div className="text-xs text-neutral-500">Ride Type</div>
                                <div className="text-sm font-bold capitalize">{ride.ride_type}</div>
                            </div>
                            {ride.distance && (
                                <div>
                                    <div className="text-xs text-neutral-500">Distance</div>
                                    <div className="text-sm font-bold">{ride.distance} km</div>
                                </div>
                            )}
                            <div>
                                <div className="text-xs text-neutral-500">Total</div>
                                <div className="text-xl font-black text-amber-400">₹{Math.round(ride.fare)}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Methods */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 mb-6">
                    <h2 className="text-xs text-neutral-500 uppercase tracking-wider mb-4">Payment via Razorpay</h2>
                    <div className="space-y-3">
                        {['💳 Credit / Debit Card', '📱 UPI (GPay, PhonePe)', '🏦 Net Banking', '💰 Wallets'].map((method, i) => (
                            <div key={i} className="flex items-center gap-3 bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3">
                                <span className="text-sm">{method}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-neutral-600 text-xs mt-3 text-center">All methods available in Razorpay checkout</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-400/10 text-red-400 p-4 rounded-xl text-sm mb-4">{error}</div>
                )}

                {/* Pay Button */}
                <button
                    onClick={handlePay}
                    disabled={processing || !paymentData}
                    className="w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-amber-300 transition-all active:scale-[0.98] disabled:opacity-50 hover:shadow-lg hover:shadow-amber-400/20"
                >
                    {processing ? 'Processing...' : `Pay ₹${ride ? Math.round(ride.fare) : '--'} Now`}
                </button>

                <p className="text-center text-neutral-600 text-xs mt-3">
                    🔒 Secured by Razorpay · Test Mode
                </p>
            </div>
        </div>
    )
}
