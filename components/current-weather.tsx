import { WeatherIcon } from "@/components/weather-icon"
import { describeWeather, type CurrentWeather, type DailyPoint } from "@/lib/weather"

export function CurrentWeatherHero({
  place,
  region,
  current,
  today,
  unit,
}: {
  place: string
  region: string
  current: CurrentWeather
  today?: DailyPoint
  unit: string
}) {
  const { label } = describeWeather(current.weatherCode)
  const deg = unit.includes("F") ? "°F" : "°"

  return (
    <div className="animate-float-up flex flex-col items-center pt-6 text-center text-white">
      <p className="text-lg font-medium tracking-wide text-white/90">{place}</p>
      {region && <p className="text-sm text-white/55">{region}</p>}

      <div className="relative mt-2 flex items-center justify-center">
        <WeatherIcon
          code={current.weatherCode}
          isDay={current.isDay}
          className="size-20 text-white drop-shadow-[0_8px_24px_rgba(255,255,255,0.25)]"
          strokeWidth={1.25}
          aria-hidden="true"
        />
      </div>

      <div className="mt-1 flex items-start">
        <span className="text-[7rem] font-extralight leading-none tracking-tighter tabular-nums">
          {Math.round(current.temperature)}
        </span>
        <span className="mt-3 text-4xl font-light text-white/70">{deg}</span>
      </div>

      <p className="text-lg font-medium">{label}</p>
      <p className="text-sm text-white/65">
        Feels like {Math.round(current.apparentTemperature)}°
        {today && (
          <>
            {"  ·  "}
            <span className="text-white/85">H:{Math.round(today.tempMax)}°</span>{" "}
            <span className="text-white/60">L:{Math.round(today.tempMin)}°</span>
          </>
        )}
      </p>
      <span className="sr-only">
        Current temperature {Math.round(current.temperature)} degrees, {label}
      </span>
    </div>
  )
}
