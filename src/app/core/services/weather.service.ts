import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, forkJoin, map, of, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CITIES } from '../constants/cities';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiKey = environment.openWeather.apiKey;
  private baseUrl = environment.openWeather.baseUrl;
  private geoUrl = environment.openWeather.geoUrl;

  // Obtener coordenadas por nombre de ciudad
  getCoordinates(city: string): Observable<any> {
    return this.http.get(
      `${this.geoUrl}?q=${city}&limit=1&appid=${this.apiKey}`,
    );
  }

  // Buscar ciudades (Autocomplete) - API
  searchCities(query: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.geoUrl}/direct?q=${query}&limit=5&appid=${this.apiKey}`,
    );
  }

  // Reverse geocoding to get city name from coordinates
  reverseGeocode(lat: number, lon: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.geoUrl}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`,
    );
  }

  // Buscar ciudades (Autocomplete) - LOCAL
  searchLocalCities(query: string): any[] {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return CITIES.filter((city) =>
      city.name.toLowerCase().startsWith(lowerQuery),
    ).slice(0, 5); // Limit local results
  }

  // Get Current Weather (API 2.5)
  getCurrentWeather(
    lat: number,
    lon: number,
    units: string = 'imperial',
    lang: string = 'en',
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${this.apiKey}`,
    );
  }

  // Get 5 Day / 3 Hour Forecast (API 2.5)
  getForecast(
    lat: number,
    lon: number,
    units: string = 'imperial',
    lang: string = 'en',
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${this.apiKey}`,
    );
  }

  // Get UV Index (Legacy API for Standard Plan)
  getUVIndex(lat: number, lon: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/uvi?lat=${lat}&lon=${lon}&appid=${this.apiKey}`,
    );
  }

  // Unified method to get full weather data by coordinates (mimics OneCall)
  getWeather(
    lat: number,
    lon: number,
    units: string = 'imperial',
    lang: string = 'en',
  ): Observable<any> {
    return forkJoin({
      current: this.getCurrentWeather(lat, lon, units, lang),
      forecast: this.getForecast(lat, lon, units, lang),
      uv: this.getUVIndex(lat, lon).pipe(catchError(() => of({ value: 0 }))), // Catch errors, default to 0
      geo: this.reverseGeocode(lat, lon).pipe(
        // Fail gracefully if reverse geo fails
        switchMap((res) => of(res)),
        catchError(() => of([])),
      ),
    }).pipe(
      map(({ current, forecast, uv, geo }) => {
        // Use the name from reverse geocoding if available, as it is more precise
        let exactName = current.name;
        if (geo && geo.length > 0) {
          const location = geo[0];
          // Prefer localized name
          if (location.local_names && location.local_names[lang]) {
            exactName = location.local_names[lang];
          } else {
            exactName = location.name;
          }
        }

        // Override the name in current weather object
        const currentWithPreciseName = { ...current, name: exactName };
        return this.mapToWeatherData(
          lat,
          lon,
          currentWithPreciseName,
          forecast,
          uv.value, // Pass UV value
          units, // Pass units
        );
      }),
    );
  }

  // Helper to fetch both and map to OneCall-like structure
  getWeatherByCity(
    city: string,
    units: string = 'imperial',
    lang: string = 'en',
  ): Observable<any> {
    return this.getCoordinates(city).pipe(
      switchMap((geoData: any[]) => {
        if (geoData.length > 0) {
          const { lat, lon } = geoData[0];
          return forkJoin({
            current: this.getCurrentWeather(lat, lon, units, lang),
            forecast: this.getForecast(lat, lon, units, lang),
            uv: this.getUVIndex(lat, lon).pipe(
              catchError(() => of({ value: 0 })),
            ),
          }).pipe(
            map(({ current, forecast, uv }) =>
              this.mapToWeatherData(
                lat,
                lon,
                current,
                forecast,
                uv.value,
                units,
              ),
            ),
          );
        } else {
          throw new Error('City not found');
        }
      }),
    );
  }

  private mapToWeatherData(
    lat: number,
    lon: number,
    current: any,
    forecast: any,
    uvValue: number = 0,
    units: string = 'imperial', // Add units parameter
  ): any {
    // Current Weather
    let windSpeed = current.wind.speed;
    if (units === 'metric') {
      windSpeed = windSpeed * 3.6; // Convert m/s to km/h
    }

    const currentWeather = {
      name: current.name,
      country: current.sys.country,
      dt: current.dt,
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
      temp: current.main.temp,
      feels_like: current.main.feels_like,
      pressure: current.main.pressure,
      humidity: current.main.humidity,
      dew_point: 0, // Not available in 2.5 directly
      uvi: uvValue, // Use real UV value
      clouds: current.clouds.all,
      visibility: current.visibility,
      wind_speed: windSpeed,
      wind_deg: current.wind.deg,
      weather: current.weather,
    };

    // Process Forecast for Daily and Hourly
    const dailyMap = new Map<string, any>();
    const hourlyList = [];

    // Hourly: Take first 8 items (approx 24h)
    for (let i = 0; i < Math.min(forecast.list.length, 8); i++) {
      const item = forecast.list[i];
      hourlyList.push({
        dt: item.dt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        pressure: item.main.pressure,
        humidity: item.main.humidity,
        dew_point: 0,
        uvi: 0,
        clouds: item.clouds.all,
        visibility: item.visibility,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        weather: item.weather,
        pop: item.pop,
      });
    }

    // Daily: Aggregate high/lows
    forecast.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          dt: item.dt,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          weather: item.weather[0], // Take first weather state
          humidity: [],
          wind_speed: [],
        });
      }
      const day = dailyMap.get(date);
      day.temp_min = Math.min(day.temp_min, item.main.temp_min);
      day.temp_max = Math.max(day.temp_max, item.main.temp_max);
      if (item.main.humidity) day.humidity.push(item.main.humidity);
      // Prioritize mid-day weather icon if available, else keep first
    });

    const dailyList = Array.from(dailyMap.values())
      .map((day) => ({
        dt: day.dt,
        sunrise: 0,
        sunset: 0,
        temp: {
          day: (day.temp_max + day.temp_min) / 2,
          min: day.temp_min,
          max: day.temp_max,
          night: day.temp_min,
          eve: day.temp_max,
          morn: day.temp_min,
        },
        feels_like: { day: 0, night: 0, eve: 0, morn: 0 },
        pressure: 0,
        humidity: day.humidity.length
          ? day.humidity.reduce((a: number, b: number) => a + b, 0) /
            day.humidity.length
          : 0,
        dew_point: 0,
        wind_speed: 0,
        wind_deg: 0,
        weather: [day.weather],
        clouds: 0,
        pop: 0,
        uvi: 0,
      }))
      .slice(0, 5); // Consolidate to top 5 days

    return {
      lat,
      lon,
      timezone: 'UTC', // 2.5 gives offset in seconds (current.timezone), mapping needed if strictly used
      timezone_offset: current.timezone,
      current: currentWeather,
      daily: dailyList,
      hourly: hourlyList,
    };
  }
}
