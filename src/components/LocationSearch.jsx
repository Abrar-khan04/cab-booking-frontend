import { useState, useRef, useEffect } from 'react'

export default function LocationSearch({ label, value, onChange, icon, iconColor }) {
    const [query, setQuery] = useState(value || '')
    const [results, setResults] = useState([])
    const [showResults, setShowResults] = useState(false)
    const timeoutRef = useRef(null)
    const wrapperRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])


    ///update query when value changes from map click
    useEffect(() => {
        if (value) setQuery(value)
    }, [value])


    const handleSearch = (text) => {
        setQuery(text)
        if (timeoutRef.current)
            clearTimeout(timeoutRef.current)

        if (text.length < 3) {
            setResults([])
            setShowResults(false)
            return
        }
        timeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5&countrycodes=in`)
                const data = await res.json()
                setResults(data)
                setShowResults(true)
            } catch (err) {
                console.error("search error", err)
            }
        }, 500) //500ms debounce
    }
    const handleSelect = (result) => {
        setQuery(result.display_name)
        setShowResults(false)
        onChange({
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address: result.display_name
        })
    }

    return (
        <div ref={wrapperRef} className='relative'>
            <div className='relative'>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-md ${iconColor}`}></div>
                <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)} onFocus={() => results.length > 0 && setShowResults(true)} placeholder={label} className='w-full bg-[#1a1a1a] border border-white/5 rounded-2xl pl-10 pr-4 py-4 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-amber-400/30 transition' />
            </div>
            {/*====Dropdown results====*/}
            {showResults && results.length > 0 && (
                <div className='w-full bg-[#1a1a1a] border border-white/5 rounded-2xl pl-10 pr-4 py-4 text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-amber-400/30 transition'>
                    {results.map((result, i) => (
                        <button key={i} onClick={() => handleSelect(result)} className='w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-amber-400/10 hover:text-white transition border-b border-white/5 last:border-0'>
                            <div className='flex items-start gap-2'>
                                <span className='text-amber-400 mt-0.5'>📍</span>
                                <span className='line-clamp-2'>{result.display_name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}