// Weather data layer built on the free Open-Meteo API (no API key required).
// Docs: https://open-meteo.com/en/docs

export type GeoResult = {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
  timezone: string
}

export type CurrentWeather = {
  time: string
  temperature: number
  apparentTemperature: number
  humidity: number
  isDay: boolean
  weatherCode: number
  windSpeed: number
  windDirection: number
  pressure: number
  uvIndex: number
  precipitation: number
}

export type HourlyPoint = {
  time: string
  temperature: number
  weatherCode: number
  precipitationProbability: number
  isDay: boolean
}

export type DailyPoint = {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
  sunrise: string
  sunset: string
  precipitationProbability: number
}

export type WeatherBundle = {
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[]
  timezone: string
  units: { temperature: string; wind: string }
}

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search"
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

export async function fetchGeo(query: string): Promise<GeoResult[]> {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Location lookup failed")
  const data = await res.json()
  if (!data.results) return []
  return data.results.map((r: any) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country ?? "",
    admin1: r.admin1,
    timezone: r.timezone,
  }))
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,precipitation",
    hourly: "temperature_2m,weather_code,precipitation_probability,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max",
    timezone: "auto",
    forecast_days: "7",
  })
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`)
  if (!res.ok) throw new Error("Weather lookup failed")
  const d = await res.json()

  const c = d.current
  const nowIdx = Math.max(
    0,
    d.hourly.time.findIndex((t: string) => new Date(t).getTime() >= new Date(c.time).getTime()),
  )

  const hourly: HourlyPoint[] = d.hourly.time
    .slice(nowIdx, nowIdx + 24)
    .map((t: string, i: number) => ({
      time: t,
      temperature: d.hourly.temperature_2m[nowIdx + i],
      weatherCode: d.hourly.weather_code[nowIdx + i],
      precipitationProbability: d.hourly.precipitation_probability[nowIdx + i] ?? 0,
      isDay: d.hourly.is_day[nowIdx + i] === 1,
    }))

  const daily: DailyPoint[] = d.daily.time.map((t: string, i: number) => ({
    date: t,
    weatherCode: d.daily.weather_code[i],
    tempMax: d.daily.temperature_2m_max[i],
    tempMin: d.daily.temperature_2m_min[i],
    sunrise: d.daily.sunrise[i],
    sunset: d.daily.sunset[i],
    precipitationProbability: d.daily.precipitation_probability_max[i] ?? 0,
  }))

  return {
    timezone: d.timezone,
    units: { temperature: d.current_units.temperature_2m, wind: d.current_units.wind_speed_10m },
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      isDay: c.is_day === 1,
      weatherCode: c.weather_code,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      pressure: c.surface_pressure,
      uvIndex: d.daily.uv_index_max?.[0] ?? 0,
      precipitation: c.precipitation,
    },
    hourly,
    daily,
  }
}

// WMO weather interpretation codes -> label + condition group
type Condition = "clear" | "cloudy" | "fog" | "rain" | "snow" | "thunder"

export function describeWeather(code: number): { label: string; condition: Condition } {
  const map: Record<number, { label: string; condition: Condition }> = {
    0: { label: "Clear sky", condition: "clear" },
    1: { label: "Mainly clear", condition: "clear" },
    2: { label: "Partly cloudy", condition: "cloudy" },
    3: { label: "Overcast", condition: "cloudy" },
    45: { label: "Fog", condition: "fog" },
    48: { label: "Rime fog", condition: "fog" },
    51: { label: "Light drizzle", condition: "rain" },
    53: { label: "Drizzle", condition: "rain" },
    55: { label: "Dense drizzle", condition: "rain" },
    56: { label: "Freezing drizzle", condition: "rain" },
    57: { label: "Freezing drizzle", condition: "rain" },
    61: { label: "Light rain", condition: "rain" },
    63: { label: "Rain", condition: "rain" },
    65: { label: "Heavy rain", condition: "rain" },
    66: { label: "Freezing rain", condition: "rain" },
    67: { label: "Freezing rain", condition: "rain" },
    71: { label: "Light snow", condition: "snow" },
    73: { label: "Snow", condition: "snow" },
    75: { label: "Heavy snow", condition: "snow" },
    77: { label: "Snow grains", condition: "snow" },
    80: { label: "Rain showers", condition: "rain" },
    81: { label: "Rain showers", condition: "rain" },
    82: { label: "Violent showers", condition: "rain" },
    85: { label: "Snow showers", condition: "snow" },
    86: { label: "Snow showers", condition: "snow" },
    95: { label: "Thunderstorm", condition: "thunder" },
    96: { label: "Thunderstorm", condition: "thunder" },
    99: { label: "Severe storm", condition: "thunder" },
  }
  return map[code] ?? { label: "Unknown", condition: "cloudy" }
}

// Returns the CSS background gradient + glass tint for a given condition & daylight.
export function skyTheme(code: number, isDay: boolean) {
  const { condition } = describeWeather(code)
  const themes: Record<string, { day: string[]; night: string[]; tint: string }> = {
    clear: {
      day: ["oklch(0.72 0.14 230)", "oklch(0.55 0.16 250)", "oklch(0.38 0.12 265)"],
      night: ["oklch(0.28 0.09 265)", "oklch(0.18 0.07 270)", "oklch(0.12 0.05 275)"],
      tint: "oklch(0.7 0.13 235)",
    },
    cloudy: {
      day: ["oklch(0.66 0.05 240)", "oklch(0.5 0.05 255)", "oklch(0.36 0.05 262)"],
      night: ["oklch(0.26 0.04 262)", "oklch(0.18 0.03 265)", "oklch(0.12 0.02 268)"],
      tint: "oklch(0.62 0.05 245)",
    },
    fog: {
      day: ["oklch(0.7 0.02 240)", "oklch(0.55 0.02 250)", "oklch(0.42 0.02 258)"],
      night: ["oklch(0.28 0.02 258)", "oklch(0.2 0.02 260)", "oklch(0.14 0.01 262)"],
      tint: "oklch(0.6 0.02 245)",
    },
    rain: {
      day: ["oklch(0.55 0.07 245)", "oklch(0.4 0.07 258)", "oklch(0.28 0.06 265)"],
      night: ["oklch(0.24 0.05 262)", "oklch(0.16 0.04 266)", "oklch(0.1 0.03 270)"],
      tint: "oklch(0.5 0.08 250)",
    },
    snow: {
      day: ["oklch(0.78 0.03 235)", "oklch(0.64 0.04 245)", "oklch(0.5 0.04 255)"],
      night: ["oklch(0.32 0.03 258)", "oklch(0.22 0.02 262)", "oklch(0.15 0.02 266)"],
      tint: "oklch(0.72 0.04 240)",
    },
    thunder: {
      day: ["oklch(0.45 0.08 285)", "oklch(0.32 0.09 290)", "oklch(0.22 0.08 295)"],
      night: ["oklch(0.22 0.07 290)", "oklch(0.15 0.06 293)", "oklch(0.1 0.05 296)"],
      tint: "oklch(0.5 0.11 290)",
    },
  }
  const t = themes[condition]
  const stops = isDay ? t.day : t.night
  return {
    background: `radial-gradient(120% 120% at 50% 0%, ${stops[0]} 0%, ${stops[1]} 45%, ${stops[2]} 100%)`,
    tint: t.tint,
    condition,
  }
}

export function formatHour(iso: string, tz: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", timeZone: tz }).format(new Date(iso))
}

export function formatDay(iso: string, tz: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: tz }).format(new Date(iso))
}

export function formatTime(iso: string, tz: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }).format(
    new Date(iso),
  )
}
