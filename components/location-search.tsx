"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { LoaderCircle, MapPin, Navigation, Search } from "lucide-react"
import { fetchGeo, type GeoResult } from "@/lib/weather"

export function LocationSearch({
  onSelect,
  onLocate,
  locating,
}: {
  onSelect: (r: GeoResult) => void
  onLocate: () => void
  locating: boolean
}) {
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const { data, isLoading } = useSWR<GeoResult[]>(
    debounced.length >= 2 ? ["geo", debounced] : null,
    () => fetchGeo(debounced),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function pick(r: GeoResult) {
    onSelect(r)
    setQuery("")
    setDebounced("")
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="glass glass-specular flex items-center gap-3 rounded-2xl px-4 py-3">
        <Search className="size-5 shrink-0 text-white/60" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for a city..."
          aria-label="Search for a city"
          className="w-full bg-transparent text-[15px] text-white placeholder:text-white/45 focus:outline-none"
        />
        <button
          type="button"
          onClick={onLocate}
          aria-label="Use my location"
          className="grid size-8 shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          {locating ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Navigation className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {open && debounced.length >= 2 && (
        <div className="glass-strong absolute z-20 mt-2 w-full overflow-hidden rounded-2xl p-1.5">
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-white/60">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Searching...
            </div>
          )}
          {!isLoading && data && data.length === 0 && (
            <div className="px-3 py-3 text-sm text-white/60">No matches found.</div>
          )}
          {!isLoading &&
            data?.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pick(r)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/12"
              >
                <MapPin className="size-4 shrink-0 text-white/55" aria-hidden="true" />
                <span className="text-sm text-white">
                  {r.name}
                  <span className="text-white/55">
                    {r.admin1 ? `, ${r.admin1}` : ""} · {r.country}
                  </span>
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
