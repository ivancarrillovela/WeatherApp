import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, forkJoin, map, of, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CITIES } from '../constants/cities';
import {
  WeatherData,
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
} from 'src/app/core/models/weather.model';

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

  // Buscar ciudades (Autocompletado) - API
  searchCities(query: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.geoUrl}/direct?q=${query}&limit=5&appid=${this.apiKey}`,
    );
  }

  // Geocodificación inversa para obtener el nombre de la ciudad desde coordenadas
  reverseGeocode(lat: number, lon: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.geoUrl}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`,
    );
  }

  // Buscar ciudades (Autocompletado) - LOCAL
  searchLocalCities(query: string): any[] {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return CITIES.filter((city) =>
      city.name.toLowerCase().startsWith(lowerQuery),
    ).slice(0, 5); // Limitar resultados locales
  }

  // Obtener Clima Actual (API 2.5)
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

  // Obtener Pronóstico de 5 Días / 3 Horas (API 2.5)
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

  // Obtener Índice UV (API Legacy para Plan Estándar)
  getUVIndex(lat: number, lon: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/uvi?lat=${lat}&lon=${lon}&appid=${this.apiKey}`,
    );
  }

  // Obtener nombre exacto mediante geocodificación inversa
  private getNameFromGeo(
    geo: any[],
    currentName: string,
    lang: string,
  ): string {
    if (geo && geo.length > 0) {
      const location = geo[0];
      // Preferir nombre localizado
      if (location.local_names && location.local_names[lang]) {
        return location.local_names[lang];
      } else {
        return location.name;
      }
    }
    return currentName;
  }

  // Método unificado para obtener todos los datos climáticos por coordenadas
  getWeather(
    lat: number,
    lon: number,
    units: string = 'imperial',
    lang: string = 'en',
  ): Observable<WeatherData> {
    return forkJoin({
      current: this.getCurrentWeather(lat, lon, units, lang),
      forecast: this.getForecast(lat, lon, units, lang),
      uv: this.getUVIndex(lat, lon).pipe(catchError(() => of({ value: 0 }))), // Capturar error, por defecto 0
      geo: this.reverseGeocode(lat, lon).pipe(
        // Fallar suavemente si la geocodificación inversa falla
        switchMap((res) => of(res)),
        catchError(() => of([])),
      ),
    }).pipe(
      map(({ current, forecast, uv, geo }) => {
        // Usar el nombre de la geocodificación inversa si está disponible
        const exactName = this.getNameFromGeo(geo, current.name, lang);

        // Sobrescribir el nombre en el objeto current
        const currentWithPreciseName = { ...current, name: exactName };
        return this.mapToWeatherData(
          lat,
          lon,
          currentWithPreciseName,
          forecast,
          uv.value, // Pasar valor UV
          units, // Pasar unidades
        );
      }),
    );
  }

  // Ayudante para obtener datos por ciudad (misma estructura)
  getWeatherByCity(
    city: string,
    units: string = 'imperial',
    lang: string = 'en',
  ): Observable<WeatherData> {
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
          throw new Error('Ciudad no encontrada');
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
    units: string = 'imperial',
  ): WeatherData {
    // Clima Actual
    let windSpeed = current.wind.speed;
    if (units === 'metric') {
      windSpeed = windSpeed * 3.6; // Convertir m/s a km/h
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
      dew_point: 0,
      uvi: uvValue,
      clouds: current.clouds.all,
      visibility: current.visibility,
      wind_speed: windSpeed,
      wind_deg: current.wind.deg,
      weather: current.weather,
      pop: forecast.list && forecast.list.length > 0 ? forecast.list[0].pop : 0, // Probabilidad de lluvia actual (de pronóstico por hora)
    };

    // Procesar Pronóstico Diario y por Hora
    const dailyMap = new Map<string, any>();
    const hourlyList = [];

    // Por Hora: Procesar TODA la lista para permitir "rolling window" en la UI
    // La vista por defecto limitará esto con slice, pero necesitamos los datos completos disponibles.
    for (let i = 0; i < forecast.list.length; i++) {
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

    // Diario: Agregar máximas/mínimas
    forecast.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          dt: item.dt,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          weather: item.weather[0], // Tomar el primer estado del clima
          humidity: [],
          wind_speed: [],
          wind_entries: [], // Para calcular dirección dominante
          pop: [], // Array para probabilidad de lluvia
          clouds: [],
          feels_like: [],
          pressure: [],
        });
      }
      const day = dailyMap.get(date);
      day.temp_min = Math.min(day.temp_min, item.main.temp_min);
      day.temp_max = Math.max(day.temp_max, item.main.temp_max);
      if (item.main.humidity) day.humidity.push(item.main.humidity);
      if (item.wind && item.wind.speed !== undefined) {
        day.wind_speed.push(item.wind.speed);
        day.wind_entries.push({ speed: item.wind.speed, deg: item.wind.deg });
      }
      if (item.clouds && item.clouds.all !== undefined)
        day.clouds.push(item.clouds.all);
      if (item.pop !== undefined) day.pop.push(item.pop);
      if (item.main.feels_like !== undefined)
        day.feels_like.push(item.main.feels_like);
      if (item.main.pressure !== undefined)
        day.pressure.push(item.main.pressure);

      // Guardar segmento horario para desglose
      if (!day.hourlySegments) day.hourlySegments = [];
      day.hourlySegments.push({
        dt: item.dt,
        temp: item.main.temp,
        weather: item.weather,
        wind_speed: item.wind ? item.wind.speed : 0,
        pop: item.pop || 0,
      });
    });

    const dailyList = Array.from(dailyMap.values())
      .map((day) => {
        // Calcular Viento Máximo
        let maxWind = day.wind_speed.length
          ? Math.max(...day.wind_speed)
          : null;

        // Calcular Dirección del Viento Dominante (del momento de más viento)
        let dominantDeg = null;
        if (day.wind_entries && day.wind_entries.length > 0) {
          const maxWindEntry = day.wind_entries.reduce(
            (prev: any, current: any) =>
              prev.speed > current.speed ? prev : current,
          );
          dominantDeg = maxWindEntry.deg;
        }

        // Calcular Presión Promedio
        const avgPressure = day.pressure.length
          ? Math.round(
              day.pressure.reduce((a: number, b: number) => a + b, 0) /
                day.pressure.length,
            )
          : null;

        // Calcular Sensación Térmica Promedio
        const avgFeelsLike = day.feels_like.length
          ? Math.round(
              day.feels_like.reduce((a: number, b: number) => a + b, 0) /
                day.feels_like.length,
            )
          : null;

        // Conversión de viento si es metric (m/s -> km/h)
        if (units === 'metric' && maxWind !== null) {
          maxWind = maxWind * 3.6;
        }

        // Calcular Probabilidad de Lluvia Máxima (Estilo Google/Estándar)
        // Si a cualquier hora del día la probabilidad es alta, el día tiene riesgo alto.
        const maxPop = day.pop.length ? Math.max(...day.pop) : null;

        return {
          dt: day.dt,
          sunrise: null,
          sunset: null,
          temp: {
            day: (day.temp_max + day.temp_min) / 2,
            min: day.temp_min,
            max: day.temp_max,
            night: day.temp_min,
            eve: day.temp_max,
            morn: day.temp_min,
          },
          feels_like: { day: avgFeelsLike, night: 0, eve: 0, morn: 0 },
          pressure: avgPressure,
          humidity: day.humidity.length
            ? day.humidity.reduce((a: number, b: number) => a + b, 0) /
              day.humidity.length
            : null,
          visibility: null,
          dew_point: null,
          wind_speed: maxWind,
          wind_deg: dominantDeg,
          weather: [day.weather],
          clouds: day.clouds.length
            ? Math.round(
                day.clouds.reduce((a: number, b: number) => a + b, 0) /
                  day.clouds.length,
              )
            : null,
          pop: maxPop,
          hourlySegments: day.hourlySegments || [],
          uvi: null,
        };
      })
      .slice(0, 5); // Consolidar a los primeros 5 días

    return {
      lat,
      lon,
      timezone: 'UTC',
      timezone_offset: current.timezone,
      current: currentWeather,
      daily: dailyList,
      hourly: hourlyList,
    };
  }
}
