import { Link, useLocation } from 'react-router-dom'

const navItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/book-ride', label: 'Book', icon: '🚗' },
    { path: '/history', label: 'History', icon: '📋' },
    { path: '/help', label: 'Help', icon: '🆘' },
    { path: '/profile', label: 'Profile', icon: '👤' },
]

export default function BottomNav() {
    const location = useLocation()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="glass border-t border-white/5 px-2 py-1.5 safe-area-bottom">
                <div className="flex items-center justify-around">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path === '/dashboard' && location.pathname.startsWith('/dashboard'))
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all active:scale-90 ${isActive
                                    ? 'text-amber-400'
                                    : 'text-neutral-500 hover:text-neutral-300'
                                    }`}
                            >
                                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                                <span className={`text-[10px] font-semibold ${isActive ? 'text-amber-400' : ''}`}>{item.label}</span>
                                {isActive && <div className="w-1 h-1 bg-amber-400 rounded-full mt-0.5"></div>}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
