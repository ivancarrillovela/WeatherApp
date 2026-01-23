export interface WeatherData {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly?: HourlyForecast[];
}

export interface CurrentWeather {
  name?: string;
  country?: string;
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  weather: WeatherCondition[];
  pop?: number;
}

export interface DailyForecast {
  dt: number;
  sunrise: number | null;
  sunset: number | null;
  moonrise?: number;
  moonset?: number;
  moon_phase?: number;
  temp: Temperature;
  feels_like: FeelsLike;
  pressure: number | null;
  humidity: number | null;
  dew_point: number | null;
  wind_speed: number | null;
  wind_deg: number | null;
  weather: WeatherCondition[];
  clouds: number | null;
  pop: number | null;
  rain?: number;
  uvi: number | null; // Permitir null
  hourlySegments?: HourlyForecast[];
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  weather: WeatherCondition[];
  pop: number;
}

export interface Temperature {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface FeelsLike {
  day: number | null;
  night: number | null;
  eve: number | null;
  morn: number | null;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}
