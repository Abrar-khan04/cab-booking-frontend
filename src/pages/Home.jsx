import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

export default function Home() {
    const { user } = useUser()

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">

            {/* ========== HERO SECTION ========== */}
            <section className="relative px-6 py-16 md:py-28 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-400/8 rounded-full blur-[180px] pointer-events-none"></div>
                <div className="absolute top-40 left-10 w-3 h-3 bg-amber-400/40 rounded-full animate-float"></div>
                <div className="absolute top-60 right-20 w-2 h-2 bg-amber-400/30 rounded-full animate-float delay-200"></div>
                <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-amber-400/20 rounded-full animate-float delay-400"></div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                        {/* Left: Text Content */}
                        <div className="animate-slide-up">
                            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-amber-400/20 bg-amber-400/5">
                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                                <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">Available Now</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6">
                                Get a Ride
                                <br />
                                <span className="gradient-text">Anywhere,</span>
                                <br />
                                Anytime.
                            </h1>

                            <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-md">
                                Request a ride, hop in, and go. Your reliable cab is just a tap away with real-time tracking.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <SignedOut>
                                    <SignUpButton mode="redirect">
                                        <button className="bg-amber-400 text-black px-8 py-4 rounded-2xl text-base font-bold hover:bg-amber-300 transition-all hover:shadow-xl hover:shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-2">
                                            <span>🚕</span> Book Your Ride
                                        </button>
                                    </SignUpButton>
                                    <button className="border border-white/10 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-white/5 transition-all active:scale-95">
                                        Drive & Earn →
                                    </button>
                                </SignedOut>
                                <SignedIn>
                                    <Link to="/dashboard" className="bg-amber-400 text-black px-8 py-4 rounded-2xl text-base font-bold hover:bg-amber-300 transition-all hover:shadow-xl hover:shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-2">
                                        <span>🚕</span> Go to Dashboard
                                    </Link>
                                </SignedIn>
                            </div>

                            {/* Trust badges */}
                            <div className="flex items-center gap-6 mt-8">
                                <div className="flex items-center gap-1">
                                    <span className="text-amber-400 text-sm">★★★★★</span>
                                    <span className="text-neutral-500 text-xs">4.9 Rating</span>
                                </div>
                                <div className="h-4 w-px bg-white/10"></div>
                                <span className="text-neutral-500 text-xs">50K+ rides completed</span>
                            </div>
                        </div>

                        {/* Right: Interactive Booking Card */}
                        <div className="animate-slide-up delay-200">
                            <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 shadow-2xl shadow-black/50 animate-pulse-glow">
                                {/* Mini map area */}
                                <div className="map-pattern bg-[#0d0d0d] rounded-2xl h-48 mb-5 relative overflow-hidden">
                                    {/* Map dots decoration */}
                                    <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 animate-pulse"></div>
                                    <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                                    {/* Route line */}
                                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                        <path d="M 96 48 Q 150 96 200 80 Q 250 64 280 120" stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="6 4" opacity="0.6" />
                                    </svg>
                                    {/* Animated car */}
                                    <div className="absolute top-[45%] animate-car">
                                        <span className="text-2xl">🚕</span>
                                    </div>
                                </div>

                                {/* Pickup/Dropoff inputs */}
                                <div className="space-y-3 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-amber-400 shadow-md shadow-amber-400/40"></div>
                                        <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3">
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Pickup</span>
                                            <span className="text-sm text-white">Current Location</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="route-line h-4"></div>
                                        </div>
                                        <div className="flex-1"></div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-sm bg-green-400 shadow-md shadow-green-400/40"></div>
                                        <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3">
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Drop-off</span>
                                            <span className="text-sm text-neutral-500">Where to?</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ride options */}
                                <div className="grid grid-cols-3 gap-2 mb-5">
                                    {[
                                        { type: 'Bike', price: '₹49', time: '5 min', icon: '🏍️' },
                                        { type: 'Standard', price: '₹149', time: '8 min', icon: '🚗', selected: true },
                                        { type: 'Premium', price: '₹299', time: '6 min', icon: '✨' },
                                    ].map((ride) => (
                                        <div
                                            key={ride.type}
                                            className={`text-center p-3 rounded-xl cursor-pointer transition-all ${ride.selected
                                                    ? 'bg-amber-400/10 border border-amber-400/40'
                                                    : 'bg-[#1a1a1a] border border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{ride.icon}</div>
                                            <div className={`text-xs font-semibold ${ride.selected ? 'text-amber-400' : 'text-white'}`}>{ride.type}</div>
                                            <div className="text-[10px] text-neutral-500">{ride.price} · {ride.time}</div>
                                        </div>
                                    ))}
                                </div>

                                <SignedOut>
                                    <SignUpButton mode="redirect">
                                        <button className="w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-amber-300 transition-all active:scale-[0.98]">
                                            Book Now
                                        </button>
                                    </SignUpButton>
                                </SignedOut>
                                <SignedIn>
                                    <Link to="/dashboard" className="w-full bg-amber-400 text-black py-4 rounded-2xl font-bold text-base hover:bg-amber-300 transition-all active:scale-[0.98] block text-center">
                                        Book Now
                                    </Link>
                                </SignedIn>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== STATS BAR ========== */}
            <section className="max-w-5xl mx-auto px-6 py-10">
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { value: '10K+', label: 'Active Riders', icon: '👥' },
                        { value: '5K+', label: 'Drivers Online', icon: '🚗' },
                        { value: '50K+', label: 'Rides Done', icon: '✅' },
                        { value: '4.9★', label: 'App Rating', icon: '⭐' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl mb-2">{stat.icon}</div>
                            <div className="text-2xl md:text-3xl font-black text-amber-400">{stat.value}</div>
                            <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========== FEATURES ========== */}
            <section id="features" className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Features</span>
                    <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4">
                        Everything You Need
                    </h2>
                    <p className="text-neutral-500 max-w-lg mx-auto">A complete ride experience from booking to payment.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                        { icon: '📍', title: 'Live Tracking', desc: 'Track your driver in real-time on an interactive map with accurate ETAs.', color: 'amber' },
                        { icon: '💳', title: 'Easy Payments', desc: 'Pay with cards, UPI, wallets, or cash. Split fares with friends.', color: 'green' },
                        { icon: '🛡️', title: 'Safe Rides', desc: 'Verified drivers, SOS button, live trip sharing with family.', color: 'blue' },
                        { icon: '⭐', title: 'Rate Drivers', desc: 'Rate and review your driver to maintain ride quality.', color: 'purple' },
                        { icon: '🕐', title: 'Ride History', desc: 'View all past trips, download invoices, and track expenses.', color: 'pink' },
                        { icon: '🎫', title: 'Promo Codes', desc: 'Apply discount coupons and get cashback on every ride.', color: 'orange' },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="group bg-[#111111] border border-white/5 rounded-2xl p-7 hover:border-amber-400/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:bg-amber-400/20 transition-all">
                                {feature.icon}
                            </div>
                            <h3 className="text-base font-bold mb-2 group-hover:text-amber-400 transition">{feature.title}</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========== HOW IT WORKS ========== */}
            <section id="how" className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">How It Works</span>
                    <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4">
                        3 Simple Steps
                    </h2>
                    <p className="text-neutral-500">Start riding in under a minute.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { step: '01', icon: '📍', title: 'Set Location', desc: 'Enter your pickup and drop-off locations on the map.' },
                        { step: '02', icon: '🔍', title: 'Get Matched', desc: 'We instantly find the nearest available driver for you.' },
                        { step: '03', icon: '🎉', title: 'Enjoy the Ride', desc: 'Sit back, track live, and pay cashlessly at the end.' },
                    ].map((item, i) => (
                        <div key={i} className="relative group">
                            <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center hover:border-amber-400/30 transition-all h-full">
                                <div className="relative inline-block mb-6">
                                    <div className="w-20 h-20 bg-amber-400/10 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-amber-400/20 transition-all">
                                        {item.icon}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
                                        <span className="text-black text-xs font-black">{item.step}</span>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                            </div>
                            {/* Connector arrow (hidden on mobile and last item) */}
                            {i < 2 && (
                                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-amber-400/30">
                                    →
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ========== RIDE OPTIONS ========== */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Choose Your Ride</span>
                    <h2 className="text-3xl md:text-5xl font-black mt-3 mb-4">
                        Rides for Everyone
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { icon: '🏍️', name: 'CabBike', desc: 'Quick and affordable rides for one', price: 'From ₹29', features: ['Single rider', 'Fastest pickup', 'Budget friendly'] },
                        { icon: '🚗', name: 'CabGo', desc: 'Comfortable everyday rides', price: 'From ₹99', features: ['Up to 4 riders', 'AC available', 'Best value'], popular: true },
                        { icon: '✨', name: 'CabPremium', desc: 'Premium cars, top-rated drivers', price: 'From ₹249', features: ['Luxury vehicles', 'Professional drivers', 'Priority support'] },
                    ].map((ride, i) => (
                        <div
                            key={i}
                            className={`relative bg-[#111111] border rounded-2xl p-7 transition-all hover:-translate-y-1 ${ride.popular ? 'border-amber-400/40 shadow-lg shadow-amber-400/5' : 'border-white/5'
                                }`}
                        >
                            {ride.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            <div className="text-4xl mb-4">{ride.icon}</div>
                            <h3 className="text-xl font-bold mb-1">{ride.name}</h3>
                            <p className="text-sm text-neutral-500 mb-4">{ride.desc}</p>
                            <div className="text-2xl font-black text-amber-400 mb-5">{ride.price}</div>
                            <ul className="space-y-2 mb-6">
                                {ride.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm text-neutral-400">
                                        <span className="text-amber-400 text-xs">✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <SignedOut>
                                <SignUpButton mode="redirect">
                                    <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${ride.popular
                                            ? 'bg-amber-400 text-black hover:bg-amber-300'
                                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                        }`}>
                                        Select {ride.name}
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link to="/dashboard" className={`w-full py-3 rounded-xl font-bold text-sm transition-all block text-center ${ride.popular
                                        ? 'bg-amber-400 text-black hover:bg-amber-300'
                                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                    }`}>
                                    Select {ride.name}
                                </Link>
                            </SignedIn>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========== CTA ========== */}
            <section className="max-w-4xl mx-auto px-6 py-16">
                <div className="relative bg-gradient-to-br from-amber-400/15 to-orange-500/5 border border-amber-400/20 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/5 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/5 rounded-full blur-[80px]"></div>
                    <div className="relative z-10">
                        <div className="text-5xl mb-5">🚕</div>
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            Ready to <span className="text-amber-400">Ride</span>?
                        </h2>
                        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                            Join thousands of happy riders. Sign up now and get your first ride free!
                        </p>
                        <SignedOut>
                            <SignUpButton mode="redirect">
                                <button className="bg-amber-400 text-black px-10 py-4 rounded-2xl text-lg font-bold hover:bg-amber-300 transition-all hover:shadow-xl hover:shadow-amber-400/20 active:scale-95">
                                    Get Started Free
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Link to="/dashboard" className="inline-block bg-amber-400 text-black px-10 py-4 rounded-2xl text-lg font-bold hover:bg-amber-300 transition-all">
                                Open Dashboard
                            </Link>
                        </SignedIn>
                    </div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                                    <span className="text-black font-black text-sm">C</span>
                                </div>
                                <span className="font-bold"><span className="text-amber-400">Cab</span>Booking</span>
                            </div>
                            <p className="text-xs text-neutral-600 leading-relaxed">Your ride, your way. Anytime, anywhere.</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Product</h4>
                            <ul className="space-y-2 text-sm text-neutral-500">
                                <li><a href="#" className="hover:text-white transition">Ride</a></li>
                                <li><a href="#" className="hover:text-white transition">Drive</a></li>
                                <li><a href="#" className="hover:text-white transition">Business</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Company</h4>
                            <ul className="space-y-2 text-sm text-neutral-500">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Legal</h4>
                            <ul className="space-y-2 text-sm text-neutral-500">
                                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition">Support</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-6 text-center">
                        <p className="text-xs text-neutral-600">© 2026 CabBooking. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}