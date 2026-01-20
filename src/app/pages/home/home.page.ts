import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonButton,
  IonIcon,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { WeatherService } from 'src/app/core/services/weather.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { WeatherIconComponent } from 'src/app/components/atoms/weather-icon/weather-icon.component';
import { HourlyBreakdownComponent } from 'src/app/components/molecules/hourly-breakdown/hourly-breakdown.component';
import { WeatherDetailCardComponent } from 'src/app/components/molecules/weather-detail-card/weather-detail-card.component';
import { ForecastListComponent } from 'src/app/components/organisms/forecast-list/forecast-list.component';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
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
    IonProgressBar,
    IonList,
    IonItem,
    IonLabel,
    TranslateModule,
    WeatherIconComponent,
    HourlyBreakdownComponent,
    WeatherDetailCardComponent,
    ForecastListComponent,
  ],
})
export class HomePage implements OnInit {
  private weatherService = inject(WeatherService);
  private settingsService = inject(SettingsService);

  weatherData: any;
  citySearch: string = '';
  currentLang: AppLanguage = 'es';
  currentUnit: UnitSystem = 'metric';
  loadingLocation: boolean = false;

  // Autocomplete
  searchSubject = new Subject<string>();
  citySuggestions: any[] = [];
  showSuggestions: boolean = false;

  constructor() {
    addIcons({ sunny, navigate, locate, water, moon, thermometer, cloud });
  }

  ngOnInit() {
    // Suscribirse a cambios de idioma para actualizar UI y recargar datos
    this.settingsService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
      if (this.weatherData) {
        const { lat, lon } = this.weatherData;
        this.loadWeather(lat, lon);
      }
    });

    // Suscribirse a cambios de unidad para recargar datos
    this.settingsService.currentUnit$.subscribe((unit) => {
      this.currentUnit = unit;
      // Si hay datos, recargar con nuevas unidades
      if (this.weatherData) {
        // Usar coordenadas actuales
        const { lat, lon } = this.weatherData;
        this.loadWeather(lat, lon);
      } else {
        // Carga inicial por defecto - intentar ubicación, si no defecto
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

  loadWeather(lat: number, lon: number) {
    this.weatherService
      .getWeather(lat, lon, this.currentUnit, this.currentLang)
      .subscribe({
        next: (data) => {
          this.weatherData = data;
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
          next: (data) => {
            this.weatherData = data;
          },
          error: (err) => {
            console.error(err);
          },
        });
    }
  }

  // Ayudante para UI de Índice UV
  getUVClass(uv: number): string {
    if (!uv) return 'low';
    if (uv <= 2) return 'low';
    if (uv <= 5) return 'moderate';
    if (uv <= 7) return 'high';
    return 'extreme';
  }

  getUVColor(uv: number): string {
    if (!uv || uv <= 2) return 'success'; // Verde
    if (uv <= 5) return 'warning'; // Amarillo
    if (uv <= 7) return 'warning'; // Naranja (Ionic warning es amarillo/naranja)
    return 'danger'; // Rojo
  }

  // Ayudante para UI de Nivel de Viento
  getWindStatus(speed: number): {
    key: string;
    color: string;
    cssClass: string;
    value: number;
  } {
    // Normalizar a km/h para cálculo unificado
    let kph = speed;
    if (this.currentUnit === 'imperial') {
      kph = speed * 1.60934;
    }

    // Cálculo proporcional: 100 km/h = 100% de la barra
    // Se limita a 1 (100%) si supera esa velocidad
    const value = Math.min(kph / 100, 1);

    let key = '';
    let color = '';
    let cssClass = '';

    if (kph < 20) {
      key = 'WEATHER.WIND_LEVEL.LIGHT';
      color = 'success';
      cssClass = 'low';
    } else if (kph < 40) {
      key = 'WEATHER.WIND_LEVEL.MODERATE';
      color = 'warning';
      cssClass = 'moderate';
    } else if (kph < 60) {
      key = 'WEATHER.WIND_LEVEL.STRONG';
      color = 'warning';
      cssClass = 'high';
    } else {
      key = 'WEATHER.WIND_LEVEL.VERY_STRONG';
      color = 'danger';
      cssClass = 'extreme';
    }

    return { key, color, cssClass, value };
  }
}
