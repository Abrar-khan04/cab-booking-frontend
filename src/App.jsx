import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react'
import { useEffect, lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { syncUser } from './services/api'
import { ToastProvider } from './components/Toast'

const SignInPage = lazy(() => import('./pages/SignIn'))
const SignUpPage = lazy(() => import('./pages/SignUp'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const BookRide = lazy(() => import('./pages/BookRide'))
const DriverDashboard = lazy(() => import('./pages/DriverDashboard'))
const RideStatus = lazy(() => import('./pages/RideStatus'))
const Payment = lazy(() => import('./pages/Payment'))
const RideHistory = lazy(() => import('./pages/RideHistory'))
const Receipt = lazy(() => import('./pages/Receipt'))
const DriverProfile = lazy(() => import('./pages/DriverProfile'))
const Help = lazy(() => import('./pages/Help'))



function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function UserSync() {
  const { user, isSignedIn } = useUser()
  useEffect(() => {
    if (isSignedIn && user) {
      syncUser({
        clerk_id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName,
        profile_pic: user.imageUrl,
      }).catch((err) => console.error('User sync:', err.message))
    }
  }, [isSignedIn, user])
  return null
}

function AppContent() {
  const location = useLocation()
  const hideNavbar = location.pathname.startsWith('/sign-in') || location.pathname.startsWith('/sign-up') || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/book-ride') || location.pathname.startsWith('/driver') || location.pathname.startsWith('/ride') || location.pathname.startsWith('/payment') || location.pathname.startsWith('/history') || location.pathname.startsWith('/receipt') || location.pathname.startsWith('/help')

  return (
    <>
      <UserSync />
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center'>
        <span className='text-amber-400'>Loading...</span>
      </div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/book-ride" element={<ProtectedRoute><BookRide /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute><DriverDashboard /></ProtectedRoute>} />
          <Route path="/ride/:id" element={<ProtectedRoute><RideStatus /></ProtectedRoute>} />
          <Route path="/payment/:rideId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><RideHistory /></ProtectedRoute>} />
          <Route path="/receipt/:rideId" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />
          <Route path="/driver-profile/:driverId" element={<ProtectedRoute><DriverProfile /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
