import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideProps,
} from "lucide-react"
import { describeWeather } from "@/lib/weather"

export function WeatherIcon({
  code,
  isDay,
  ...props
}: { code: number; isDay: boolean } & LucideProps) {
  const { condition } = describeWeather(code)

  switch (condition) {
    case "clear":
      return isDay ? <Sun {...props} /> : <Moon {...props} />
    case "cloudy":
      // Codes 1/2 are "mainly/partly" -> mixed icon; 3 overcast -> plain cloud
      if (code <= 2) return isDay ? <CloudSun {...props} /> : <CloudMoon {...props} />
      return <Cloud {...props} />
    case "fog":
      return <CloudFog {...props} />
    case "rain":
      return <CloudRain {...props} />
    case "snow":
      return <CloudSnow {...props} />
    case "thunder":
      return <CloudLightning {...props} />
    default:
      return <Cloud {...props} />
  }
}
