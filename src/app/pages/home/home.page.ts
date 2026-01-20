import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonSearchbar,
  IonSpinner,
  IonButton,
  IonIcon,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { WeatherService } from 'src/app/core/services/weather.service';
import { TranslateModule } from '@ngx-translate/core';
import {
  sunny,
  navigate,
  locate,
  water,
  moon,
  thermometer,
  cloud,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { HourlyBreakdownComponent } from 'src/app/components/molecules/hourly-breakdown/hourly-breakdown.component';
import { ForecastListComponent } from 'src/app/components/organisms/forecast-list/forecast-list.component';
import { CurrentWeatherComponent } from 'src/app/components/organisms/current-weather/current-weather.component';
import { WeatherDetailsGridComponent } from 'src/app/components/organisms/weather-details-grid/weather-details-grid.component';
import {
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

import {
  SettingsService,
  AppLanguage,
  UnitSystem,
} from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonSearchbar,
    IonSpinner,
    IonButton,
    IonIcon,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonItem,
    IonLabel,
    TranslateModule,
    HourlyBreakdownComponent,
    ForecastListComponent,
    CurrentWeatherComponent,
    WeatherDetailsGridComponent,
  ],
})
export class HomePage implements OnInit {
  private weatherService = inject(WeatherService);
  private settingsService = inject(SettingsService);

  weatherData: any;
  originalWeatherData: any; // Almacenar datos originales para revertir
  selectedDayId: number | null = null;
  displayDate: number | null = null; // Para la lógica del título dinámico

  citySearch: string = '';
  currentLang: AppLanguage = 'es';
  currentUnit: UnitSystem = 'metric';
  loadingLocation: boolean = false;

  // Autocompletado
  searchSubject = new Subject<string>();
  citySuggestions: any[] = [];
  showSuggestions: boolean = false;

  constructor() {
    addIcons({ sunny, navigate, locate, water, moon, thermometer, cloud });
  }

  ngOnInit() {
    // Sincronizar cambios de idioma y unidad para evitar condiciones de carrera
    combineLatest([
      this.settingsService.currentLang$,
      this.settingsService.currentUnit$,
    ])
      .pipe(debounceTime(50))
      .subscribe(([lang, unit]) => {
        const preserveDayId = this.selectedDayId; // Capturar día seleccionado actual antes de actualizar
        this.currentLang = lang;
        this.currentUnit = unit;

        if (this.weatherData) {
          const { lat, lon } = this.weatherData;
          this.loadWeather(lat, lon, preserveDayId);
        } else {
          // Carga inicial si no hay datos
          this.getCurrentLocation();
        }
      });

    // Configuración de Autocompletado
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 3) return [];
          return this.weatherService.searchCities(query);
        }),
      )
      .subscribe((apiResults: any[]) => {
        // Fusionar con resultados locales
        const query = this.citySearch;
        const rawLocalResults = this.weatherService.searchLocalCities(query);

        // Localizar Resultados Locales
        const localResults = rawLocalResults.map((city) => {
          const localName =
            city.local_names && city.local_names[this.currentLang]
              ? city.local_names[this.currentLang]
              : city.name;
          return { ...city, name: localName };
        });

        // Filtrar duplicados de API y Localizar Nombres
        const processedApi = apiResults
          .filter(
            (apiCity) =>
              !localResults.some(
                (local) =>
                  local.name.toLowerCase() === apiCity.name.toLowerCase(),
              ),
          )
          .map((city) => {
            // Verificar nombre localizado
            const localName =
              city.local_names && city.local_names[this.currentLang]
                ? city.local_names[this.currentLang]
                : city.name;
            return { ...city, name: localName };
          });

        this.citySuggestions = [...localResults, ...processedApi];
        this.showSuggestions = this.citySuggestions.length > 0;
      });
  }

  async getCurrentLocation() {
    this.loadingLocation = true;
    try {
      const position = await Geolocation.getCurrentPosition();
      this.loadWeather(position.coords.latitude, position.coords.longitude);
      this.citySearch = ''; // Limpiar búsqueda
    } catch (e) {
      console.error('Error obteniendo ubicación', e);
      // Fallback a Madrid si falla la ubicación
      if (!this.weatherData) {
        this.loadWeather(40.4168, -3.7038);
      }
    } finally {
      this.loadingLocation = false;
    }
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'en' ? 'es' : 'en';
    this.settingsService.setLanguage(newLang);
  }

  loadWeather(lat: number, lon: number, restoreDayId: number | null = null) {
    this.weatherService
      .getWeather(lat, lon, this.currentUnit, this.currentLang)
      .subscribe({
        next: (data) => {
          this.handleWeatherUpdate(data);

          // Restaurar selección si existía
          if (restoreDayId && this.originalWeatherData?.daily) {
            const foundDay = this.originalWeatherData.daily.find(
              (d: any) => d.dt === restoreDayId,
            );
            if (foundDay) {
              // Necesitamos re-ejecutar la lógica de selección para transformar los datos
              // Primero nos aseguramos de que no esté seleccionado para evitar el "toggle" de onDaySelected
              this.selectedDayId = null;
              this.onDaySelected(foundDay);
            }
          }
        },
        error: (err) => console.error(err),
      });
  }

  // Disparado por input de teclado
  onSearchInput(event: any) {
    const query = event.target.value;
    this.citySearch = query;
    if (query && query.length >= 2) {
      // 1. Búsqueda Local Instantánea
      const rawLocalResults = this.weatherService.searchLocalCities(query);
      const localResults = rawLocalResults.map((city) => {
        const localName =
          city.local_names && city.local_names[this.currentLang]
            ? city.local_names[this.currentLang]
            : city.name;
        return { ...city, name: localName };
      });
      this.citySuggestions = localResults;
      this.showSuggestions = localResults.length > 0;

      // 2. Disparar Búsqueda API (Debounced)
      if (query.length >= 3) {
        this.searchSubject.next(query);
      }
    } else {
      this.citySuggestions = [];
      this.showSuggestions = false;
    }
  }

  // Seleccionar de la lista desplegable
  selectCity(city: any) {
    this.citySearch = city.name;
    this.showSuggestions = false;
    this.citySuggestions = []; // Limpiar sugerencias
    this.loadWeather(city.lat, city.lon);
  }

  searchCity() {
    if (this.citySearch && this.citySearch.trim()) {
      this.showSuggestions = false;
      this.weatherService
        .getWeatherByCity(this.citySearch, this.currentUnit, this.currentLang)
        .subscribe({
          next: (data) => this.handleWeatherUpdate(data),
          error: (err) => {
            console.error(err);
          },
        });
    }
  }

  private handleWeatherUpdate(data: any) {
    this.originalWeatherData = JSON.parse(JSON.stringify(data)); // Copia profunda para preservar estado
    this.weatherData = data;
    this.selectedDayId = null; // Restablecer selección
    this.displayDate = null; // Restablecer título de la fecha
  }

  onDaySelected(day: any) {
    // 1. Si seleccionamos "Hoy" (primer día), restauramos el estado original
    if (
      this.originalWeatherData?.daily?.length > 0 &&
      day.dt === this.originalWeatherData.daily[0].dt
    ) {
      this.weatherData = JSON.parse(JSON.stringify(this.originalWeatherData));
      this.selectedDayId = null;
      this.displayDate = null;
      return;
    }

    // 2. Si pulsamos el mismo día ya seleccionado (Toggle), volvemos a la vista original
    if (this.selectedDayId === day.dt) {
      this.weatherData = JSON.parse(JSON.stringify(this.originalWeatherData));
      this.selectedDayId = null;
      this.displayDate = null;
      return;
    }

    this.selectedDayId = day.dt;
    this.displayDate = day.dt; // Almacenar timestamp para el pipe de fecha

    // Construir objeto "Current Weather" basado en el día seleccionado
    // Usamos el promedio/max del día para representar el "estado actual" de ese día
    const newCurrent = {
      ...this.originalWeatherData.current, // Mantener nombre, coordenadas, sys...
      dt: day.dt,
      sunrise: day.sunrise,
      sunset: day.sunset,
      temp: day.temp.day, // Temp promedio día
      temp_min: day.temp.min,
      temp_max: day.temp.max,
      feels_like: day.feels_like.day,
      humidity: day.humidity,
      pressure: day.pressure,
      wind_speed: day.wind_speed,
      wind_deg: day.wind_deg,
      weather: day.weather, // Array de clima
      clouds: day.clouds,
      pop: day.pop,
      uvi: day.uvi,
      visibility: day.visibility,
      dew_point: day.dew_point,
    };

    // Actualizar datos mostrados
    this.weatherData.current = newCurrent;

    // IMPORTANTE: Rolling Window de 7 elementos
    // Buscamos el índice de inicio de ese día en la lista completa original
    if (this.originalWeatherData && this.originalWeatherData.hourly) {
      // Encontramos el primer segmento que coincida con el inicio de los segmentos de ese día
      // O si no hay segmentos (raro), buscamos por fecha
      let startIndex = -1;

      if (day.hourlySegments && day.hourlySegments.length > 0) {
        const firstSegmentDt = day.hourlySegments[0].dt;
        startIndex = this.originalWeatherData.hourly.findIndex(
          (h: any) => h.dt === firstSegmentDt,
        );
      }

      if (startIndex !== -1) {
        // Tomamos 8 elementos desde ese punto (incluyendo horas del día siguiente si es necesario)
        this.weatherData.hourly = this.originalWeatherData.hourly.slice(
          startIndex,
          startIndex + 8,
        );
      } else {
        // Fallback
        this.weatherData.hourly = day.hourlySegments || [];
      }
    }
  }
}
