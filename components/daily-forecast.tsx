import { Calendar, Droplets } from "lucide-react"
import { WeatherIcon } from "@/components/weather-icon"
import { formatDay, type DailyPoint } from "@/lib/weather"

export function DailyForecast({ days, tz }: { days: DailyPoint[]; tz: string }) {
  const weekMin = Math.min(...days.map((d) => d.tempMin))
  const weekMax = Math.max(...days.map((d) => d.tempMax))
  const span = Math.max(1, weekMax - weekMin)

  return (
    <section className="glass glass-specular rounded-3xl p-4" aria-label="7-day forecast">
      <h2 className="mb-1 flex items-center gap-2 px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-white/55">
        <Calendar className="size-3.5" aria-hidden="true" />
        7-Day Forecast
      </h2>
      <ul className="flex flex-col">
        {days.map((d, i) => {
          const left = ((d.tempMin - weekMin) / span) * 100
          const width = ((d.tempMax - d.tempMin) / span) * 100
          return (
            <li
              key={d.date}
              className="flex items-center gap-3 border-t border-white/10 py-2.5 text-white first:border-t-0"
            >
              <span className="w-11 text-sm font-medium">{i === 0 ? "Today" : formatDay(d.date, tz)}</span>
              <div className="flex w-10 items-center gap-1">
                <WeatherIcon
                  code={d.weatherCode}
                  isDay
                  className="size-5 text-white"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
              <span className="flex w-9 items-center gap-0.5 text-[11px] text-sky-200">
                {d.precipitationProbability > 5 ? (
                  <>
                    <Droplets className="size-2.5" aria-hidden="true" />
                    {d.precipitationProbability}%
                  </>
                ) : null}
              </span>
              <span className="w-8 text-right text-sm text-white/55 tabular-nums">
                {Math.round(d.tempMin)}°
              </span>
              <div className="relative h-1.5 flex-1 rounded-full bg-white/12">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-300 to-amber-200"
                  style={{ left: `${left}%`, width: `${Math.max(width, 6)}%` }}
                />
              </div>
              <span className="w-8 text-sm font-semibold tabular-nums">{Math.round(d.tempMax)}°</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
