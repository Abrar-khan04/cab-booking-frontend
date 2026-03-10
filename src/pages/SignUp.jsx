import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-amber-400/3 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-10 relative z-10">
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                    <span className="text-black font-black text-lg">C</span>
                </div>
                <span className="text-xl font-bold">
                    <span className="text-amber-400">Cab</span>
                    <span className="text-white">Booking</span>
                </span>
            </Link>

            {/* Clerk SignUp */}
            <div className="relative z-10 w-full max-w-md">
                <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            </div>

            {/* Back link */}
            <Link to="/" className="mt-8 text-sm text-neutral-500 hover:text-amber-400 transition relative z-10 flex items-center gap-1">
                ← Back to Home
            </Link>
        </div>
    )
}
