import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiKey = '3db226885a5bc87c3eda44bb9b3a1209';
  private baseUrl = 'https://api.openweathermap.org/data/3.0/onecall';
  private geoUrl = 'http://api.openweathermap.org/geo/1.0/direct';

  // Obtener coordenadas por nombre de ciudad
  getCoordinates(city: string): Observable<any> {
    return this.http.get(
      `${this.geoUrl}?q=${city}&limit=1&appid=${this.apiKey}`,
    );
  }

  // Obtener clima completo (One Call 3.0) usando Lat/Lon
  getWeather(lat: number, lon: number): Observable<any> {
    // Exclude minutely to save data if not needed
    return this.http.get(
      `${this.baseUrl}?lat=${lat}&lon=${lon}&exclude=minutely&units=imperial&appid=${this.apiKey}`,
    );
    // Nota: Las imagenes muestran grados Fahrenheit (72°), por eso units=imperial.
    // Si quieres Celsius usa units=metric
  }

  // Helper para buscar ciudad y luego clima
  getWeatherByCity(city: string): Observable<any> {
    return this.getCoordinates(city).pipe(
      switchMap((geoData: any[]) => {
        if (geoData.length > 0) {
          const { lat, lon } = geoData[0];
          return this.getWeather(lat, lon);
        } else {
          throw new Error('City not found');
        }
      }),
    );
  }
}
