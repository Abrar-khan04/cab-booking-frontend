import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getDriverReviews } from '../services/api'

export default function DriverProfile() {
    const { driverId } = useParams()
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [avgRating, setAvgRating] = useState(0)

    useEffect(() => {
        async function loadReviews() {
            try {
                const data = await getDriverReviews(driverId)
                setReviews(data.reviews || [])
                if (data.reviews && data.reviews.length > 0) {
                    const avg = data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length
                    setAvgRating(Math.round(avg * 10) / 10)
                }
            } catch (err) {
                console.error('Load reviews error:', err.message)
            } finally {
                setLoading(false)
            }
        }
        loadReviews()
    }, [driverId])

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-lg ${i < rating ? '' : 'opacity-20 grayscale'}`}>⭐</span>
        ))
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link to="/dashboard" className="text-neutral-400 hover:text-white transition text-sm">← Back</Link>
                    <h1 className="text-base font-bold">Driver Reviews</h1>
                    <div className="w-12"></div>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
                {/* Rating Summary */}
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 mb-6 text-center">
                    <div className="text-5xl font-black text-amber-400 mb-2">
                        {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                        {renderStars(Math.round(avgRating))}
                    </div>
                    <div className="text-neutral-500 text-sm">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </div>

                    {/* Rating Breakdown */}
                    {reviews.length > 0 && (
                        <div className="mt-6 space-y-2 max-w-xs mx-auto">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = reviews.filter(r => r.rating === star).length
                                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                                return (
                                    <div key={star} className="flex items-center gap-3 text-sm">
                                        <span className="text-neutral-500 w-4 text-right">{star}</span>
                                        <span className="text-xs">⭐</span>
                                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-neutral-600 text-xs w-8">{count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Reviews List */}
                <h2 className="text-lg font-black mb-4">
                    All <span className="text-amber-400">Reviews</span>
                </h2>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-amber-400">Loading reviews...</div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-[#111111] border border-white/5 rounded-2xl">
                        <div className="text-4xl mb-3">📝</div>
                        <div className="text-neutral-400 font-semibold">No reviews yet</div>
                        <div className="text-neutral-600 text-sm mt-1">This driver hasn't received any reviews</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-[#111111] border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {review.rider?.profile_pic ? (
                                            <img src={review.rider.profile_pic} alt="" className="w-9 h-9 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-9 h-9 bg-amber-400/10 rounded-xl flex items-center justify-center text-sm">👤</div>
                                        )}
                                        <div>
                                            <div className="text-sm font-bold">{review.rider?.name || 'Rider'}</div>
                                            <div className="text-[10px] text-neutral-500">
                                                {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-neutral-300 leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
