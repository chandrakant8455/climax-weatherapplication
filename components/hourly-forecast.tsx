import { Droplets } from "lucide-react"
import { WeatherIcon } from "@/components/weather-icon"
import { formatHour, type HourlyPoint } from "@/lib/weather"

export function HourlyForecast({ hours, tz }: { hours: HourlyPoint[]; tz: string }) {
  return (
    <section className="glass glass-specular rounded-3xl p-4" aria-label="Hourly forecast">
      <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {hours.map((h, i) => (
          <div
            key={h.time}
            className="flex min-w-[68px] flex-col items-center gap-2 rounded-2xl px-2 py-2 text-white"
          >
            <span className="text-xs font-medium text-white/70">
              {i === 0 ? "Now" : formatHour(h.time, tz)}
            </span>
            <WeatherIcon
              code={h.weatherCode}
              isDay={h.isDay}
              className="size-6 text-white"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            {h.precipitationProbability > 5 ? (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-sky-200">
                <Droplets className="size-2.5" aria-hidden="true" />
                {h.precipitationProbability}%
              </span>
            ) : (
              <span className="text-[10px] text-transparent">·</span>
            )}
            <span className="text-sm font-semibold tabular-nums">{Math.round(h.temperature)}°</span>
          </div>
        ))}
      </div>
    </section>
  )
}
