import { Droplets, Eye, Gauge, Sunrise, Sunset, Thermometer, Wind } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { formatTime, type CurrentWeather, type DailyPoint } from "@/lib/weather"

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="glass glass-specular flex flex-col gap-2 rounded-2xl p-4 text-white">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/55">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </div>
      <div className="text-2xl font-light tabular-nums">{value}</div>
      {sub && <div className="text-xs text-white/55">{sub}</div>}
    </div>
  )
}

const uvLevel = (uv: number) =>
  uv < 3 ? "Low" : uv < 6 ? "Moderate" : uv < 8 ? "High" : uv < 11 ? "Very high" : "Extreme"

const windDir = (deg: number) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  return dirs[Math.round(deg / 45) % 8]
}

export function DetailStats({
  current,
  today,
  tz,
  windUnit,
}: {
  current: CurrentWeather
  today?: DailyPoint
  tz: string
  windUnit: string
}) {
  return (
    <section className="grid grid-cols-2 gap-3" aria-label="Weather details">
      <StatCard
        icon={Thermometer}
        label="Feels like"
        value={`${Math.round(current.apparentTemperature)}°`}
        sub="Perceived temperature"
      />
      <StatCard
        icon={Wind}
        label="Wind"
        value={`${Math.round(current.windSpeed)} ${windUnit}`}
        sub={`Direction ${windDir(current.windDirection)}`}
      />
      <StatCard
        icon={Droplets}
        label="Humidity"
        value={`${current.humidity}%`}
        sub={`Precip ${current.precipitation} mm`}
      />
      <StatCard
        icon={Gauge}
        label="Pressure"
        value={`${Math.round(current.pressure)}`}
        sub="hPa"
      />
      <StatCard
        icon={Eye}
        label="UV Index"
        value={`${Math.round(current.uvIndex)}`}
        sub={uvLevel(current.uvIndex)}
      />
      {today && (
        <StatCard
          icon={current.isDay ? Sunset : Sunrise}
          label={current.isDay ? "Sunset" : "Sunrise"}
          value={formatTime(current.isDay ? today.sunset : today.sunrise, tz)}
          sub={current.isDay ? `Rise ${formatTime(today.sunrise, tz)}` : `Set ${formatTime(today.sunset, tz)}`}
        />
      )}
    </section>
  )
}
