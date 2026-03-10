import { useState, useEffect, createContext, useContext } from "react";

const ToastContext = createContext()

export function useToast() {
    return useContext(ToastContext)
}

export function ToastProvider({ children }) {
    const [toast, setToast] = useState([])

    const addToast = (message, type = 'info') => {
        const id = Date.now()
        setToast((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToast((prev) => prev.filter((t) => t.id !== id))
        }, 5000)
    }

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/*Toast Container*/}
            <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm">
                {toast.map((t) => (
                    <div key={t.id} className={`px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl text-sm font-semibold animate-slide-in ${t.type === 'success'
                        ? 'bg-green-400/10 border-green-400/30 text-green-400'
                        : t.type === 'error'
                            ? 'bg-red-400/10 border-red-400/30 text-red-400'
                            : t.type === 'warning'
                                ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                                : 'bg-blue-400/10 border-blue-400/30 text-blue-400'
                        }`}>
                        {t.message}
                        <button onClick={() => setToast((prev) => prev.filter((x) => x.id !== t.id))} className="ml-3 text-neutral-500 hover:text-white">
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}