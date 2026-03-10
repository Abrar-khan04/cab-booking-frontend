const API_URL = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "http://localhost:5000/api"
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

async function fetchAPI(endpoint, options = {}) {
    const token = await window.Clerk?.session?.getToken()

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'API error')
    return data
}

// ===== USER APIs =====
export const syncUser = (userData) =>
    fetchAPI('/users/sync', { method: 'POST', body: JSON.stringify(userData) })

export const getProfile = () =>
    fetchAPI('/users/profile')

export const updateProfile = (updates) =>
    fetchAPI('/users/profile', { method: 'PUT', body: JSON.stringify(updates) })

// ===== RIDE APIs =====
export const createRide = (rideData) =>
    fetchAPI('/rides', { method: 'POST', body: JSON.stringify(rideData) })

export const getUserRides = (status) =>
    fetchAPI(`/rides${status ? `?status=${status}` : ''}`)

export const getRideById = (id) =>
    fetchAPI(`/rides/${id}`)

export const updateRideStatus = (id, status) =>
    fetchAPI(`/rides/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })

export const getAvailableRides = () =>
    fetchAPI('/rides/available')

// ===== PAYMENT APIs =====
export const createPayment = (rideId) =>
    fetchAPI('/payments/create', { method: 'POST', body: JSON.stringify({ ride_id: rideId }) })

export const confirmPayment = (paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    fetchAPI('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
            payment_id: paymentId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
        }),
    })

export const getPaymentHistory = () =>
    fetchAPI('/payments/history')

// ===== REVIEW APIs =====
export const submitReview = (reviewData) =>
    fetchAPI('/reviews', { method: 'POST', body: JSON.stringify(reviewData) })

export const getDriverReviews = (driverId) =>
    fetchAPI(`/reviews/driver/${driverId}`)

// ===== CANCEL RIDE =====
export const cancelRide = (rideId) =>
    fetchAPI(`/rides/${rideId}/status`, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) })

// ===== VERIFY OTP (driver starts ride) =====
export const verifyRideOTP = (rideId, otp) =>
    fetchAPI(`/rides/${rideId}/verify-otp`, { method: 'POST', body: JSON.stringify({ otp }) })


// ===== PROMO APIs =====
export const validatePromoCode = (code) =>
    fetchAPI('/promo/validate', { method: 'POST', body: JSON.stringify({ code }) })

// ===== SUPPORT APIs =====
export const createTicket = (ticketData) =>
    fetchAPI('/support/tickets', { method: 'POST', body: JSON.stringify(ticketData) })

export const getMyTickets = () =>
    fetchAPI('/support/tickets')


