import { useState } from 'react'
import { submitReview } from '../services/api'
import { useToast } from './Toast'

export default function ReviewModal({ ride, onClose, onReviewSubmitted }) {
    const [rating, setRating] = useState(0)
    const [hoveredStar, setHoveredStar] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { addToast } = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (rating === 0) {
            addToast('⭐ Please select a rating', 'error')
            return
        }

        setSubmitting(true)
        try {
            await submitReview({
                ride_id: ride.id,
                driver_id: ride.driver_id,
                rating,
                comment: comment.trim() || null,
            })
            addToast('⭐ Review submitted! Thank you!', 'success')
            onReviewSubmitted?.()
            onClose()
        } catch (err) {
            if (err.message?.includes('already reviewed')) {
                addToast('You already reviewed this ride', 'error')
            } else {
                addToast('❌ Failed to submit review', 'error')
            }
            console.error('Review error:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-[#111111] border border-white/5 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-8 animate-slide-up">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition text-xl">✕</button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-black text-white">Rate Your Ride</h2>
                    <p className="text-neutral-500 text-sm mt-1">How was your experience?</p>
                </div>

                {/* Driver Info */}
                {ride.driver && (
                    <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 mb-6">
                        {ride.driver.profile_pic ? (
                            <img src={ride.driver.profile_pic} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                            <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center text-xl">🚗</div>
                        )}
                        <div>
                            <div className="text-sm font-bold text-white">{ride.driver.name}</div>
                            <div className="text-xs text-neutral-500">{ride.ride_type} · {ride.distance ? `${ride.distance} km` : ''}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Star Rating */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    className="transition-all hover:scale-110 active:scale-95"
                                >
                                    <span className={`text-4xl ${star <= (hoveredStar || rating)
                                            ? 'grayscale-0'
                                            : 'grayscale opacity-30'
                                        } transition-all`}>
                                        ⭐
                                    </span>
                                </button>
                            ))}
                        </div>
                        {(hoveredStar || rating) > 0 && (
                            <div className="text-amber-400 text-sm font-bold animate-fade-in">
                                {ratingLabels[hoveredStar || rating]}
                            </div>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience (optional)..."
                            rows={3}
                            maxLength={500}
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-white placeholder-neutral-600 text-sm resize-none focus:outline-none focus:border-amber-400/30 transition"
                        />
                        <div className="text-right text-[10px] text-neutral-600 mt-1">{comment.length}/500</div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={rating === 0 || submitting}
                        className="w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-amber-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : `Submit ${rating > 0 ? ratingLabels[rating] : ''} Review`}
                    </button>
                </form>
            </div>
        </div>
    )
}
