"use client"

import { useState } from "react"
import useSWR from "swr"
import { LoaderCircle, TriangleAlert } from "lucide-react"
import { CurrentWeatherHero } from "@/components/current-weather"
import { DailyForecast } from "@/components/daily-forecast"
import { DetailStats } from "@/components/detail-stats"
import { HourlyForecast } from "@/components/hourly-forecast"
import { LocationSearch } from "@/components/location-search"
import { SkyBackground } from "@/components/sky-background"
import { fetchWeather, skyTheme, type GeoResult, type WeatherBundle } from "@/lib/weather"

type Place = { name: string; region: string; lat: number; lon: number }

const DEFAULT_PLACE: Place = {
  name: "San Francisco",
  region: "California, United States",
  lat: 37.7749,
  lon: -122.4194,
}

export function WeatherApp() {
  const [place, setPlace] = useState<Place>(DEFAULT_PLACE)
  const [locating, setLocating] = useState(false)

  const { data, error, isLoading } = useSWR<WeatherBundle>(
    ["weather", place.lat, place.lon],
    () => fetchWeather(place.lat, place.lon),
    { revalidateOnFocus: false, keepPreviousData: true },
  )

  function handleSelect(r: GeoResult) {
    setPlace({
      name: r.name,
      region: [r.admin1, r.country].filter(Boolean).join(", "),
      lat: r.latitude,
      lon: r.longitude,
    })
  }

  function handleLocate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPlace({
          name: "My Location",
          region: "Current position",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        })
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 10000 },
    )
  }

  const theme = data
    ? skyTheme(data.current.weatherCode, data.current.isDay)
    : skyTheme(0, true)

  return (
    <div style={{ ["--glass-tint" as string]: theme.tint }}>
      <SkyBackground background={theme.background} />

      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-10 pt-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            ClimaX<span className="text-white/50"> weather by CKJ</span>
          </h1>
        </header>

        <LocationSearch onSelect={handleSelect} onLocate={handleLocate} locating={locating} />

        {error && (
          <div className="glass flex items-center gap-3 rounded-2xl p-4 text-white">
            <TriangleAlert className="size-5 text-amber-300" aria-hidden="true" />
            <p className="text-sm">Couldn&apos;t load weather for this location. Try another search.</p>
          </div>
        )}

        {!data && isLoading && (
          <div className="flex flex-1 items-center justify-center py-20 text-white/70">
            <LoaderCircle className="size-8 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading weather</span>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-4" aria-busy={isLoading}>
            <CurrentWeatherHero
              place={place.name}
              region={place.region}
              current={data.current}
              today={data.daily[0]}
              unit={data.units.temperature}
            />
            <HourlyForecast hours={data.hourly} tz={data.timezone} />
            <DetailStats
              current={data.current}
              today={data.daily[0]}
              tz={data.timezone}
              windUnit={data.units.wind}
            />
            <DailyForecast days={data.daily} tz={data.timezone} />

            <p className="pt-2 text-center text-xs text-white/40">
              Live data from Open-Meteo · {data.timezone}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
