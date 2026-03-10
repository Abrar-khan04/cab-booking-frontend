import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
    const { user } = useUser()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)

    // Don't show navbar on app pages
    if (location.pathname.startsWith('/sign-in') ||
        location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/book-ride') ||
        location.pathname.startsWith('/driver') || location.pathname.startsWith('/ride') ||
        location.pathname.startsWith('/sign-up')) {
        return null
    }

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                            <span className="text-black font-black text-lg">C</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-amber-400">Cab</span>
                            <span className="text-white">Booking</span>
                        </span>
                    </Link>

                    {/* Nav Links - Desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { to: '/', label: 'Home' },
                            { to: '/#features', label: 'Features' },
                            { to: '/#how', label: 'How It Works' },
                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.to}
                                className="px-4 py-2 text-sm text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Auth Buttons - Desktop */}
                        <div className="hidden md:flex items-center gap-3">
                            <SignedOut>
                                <SignInButton mode="redirect">
                                    <button className="text-sm text-neutral-300 hover:text-white transition px-4 py-2.5 rounded-xl hover:bg-white/5">
                                        Log In
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="redirect">
                                    <button className="text-sm bg-amber-400 text-black px-5 py-2.5 rounded-xl font-bold hover:bg-amber-300 transition-all hover:shadow-lg hover:shadow-amber-400/20 active:scale-95">
                                        Sign Up Free
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link
                                    to="/dashboard"
                                    className="text-sm bg-amber-400/10 text-amber-400 border border-amber-400/20 px-4 py-2.5 rounded-xl font-semibold hover:bg-amber-400/20 transition"
                                >
                                    Dashboard
                                </Link>
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-9 h-9 ring-2 ring-amber-400/30"
                                        }
                                    }}
                                />
                            </SignedIn>
                        </div>

                        {/* Hamburger - Mobile */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-white/5 transition"
                        >
                            <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>
                    <div className="absolute top-[72px] left-0 right-0 bg-[#111111] border-b border-white/5 p-6 animate-slide-down">
                        <div className="flex flex-col gap-2 mb-6">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/#features', label: 'Features' },
                                { to: '/#how', label: 'How It Works' },
                            ].map((link) => (
                                <a
                                    key={link.label}
                                    href={link.to}
                                    onClick={() => setMenuOpen(false)}
                                    className="px-4 py-3 text-sm text-neutral-300 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                        <div className="flex flex-col gap-3">
                            <SignedOut>
                                <SignInButton mode="redirect">
                                    <button className="w-full text-sm text-neutral-300 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition">
                                        Log In
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="redirect">
                                    <button className="w-full text-sm bg-amber-400 text-black py-3 rounded-xl font-bold hover:bg-amber-300 transition-all">
                                        Sign Up Free
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full text-sm bg-amber-400 text-black py-3 rounded-xl font-bold text-center hover:bg-amber-300 transition-all"
                                >
                                    Go to Dashboard
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
