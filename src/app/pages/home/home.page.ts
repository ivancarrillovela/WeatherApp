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
import { addIcons } from 'ionicons';
import { sunny, navigate, locate } from 'ionicons/icons';
import { WeatherIconComponent } from 'src/app/components/atoms/weather-icon/weather-icon.component';
import { HourlyBreakdownComponent } from 'src/app/components/molecules/hourly-breakdown/hourly-breakdown.component';
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
    ForecastListComponent,
  ],
})
export class HomePage implements OnInit {
  private weatherService = inject(WeatherService);
  private settingsService = inject(SettingsService);

  weatherData: any;
  citySearch: string = '';
  currentLang: AppLanguage = 'en';
  currentUnit: UnitSystem = 'imperial';
  loadingLocation: boolean = false;

  // Autocomplete
  searchSubject = new Subject<string>();
  citySuggestions: any[] = [];
  showSuggestions: boolean = false;

  constructor() {
    addIcons({ sunny, navigate, locate });
  }

  ngOnInit() {
    // Subscribe to language changes to update UI state and reload data
    this.settingsService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
      if (this.weatherData) {
        const { lat, lon } = this.weatherData;
        this.loadWeather(lat, lon);
      }
    });

    // Subscribe to unit changes to refetch data
    this.settingsService.currentUnit$.subscribe((unit) => {
      this.currentUnit = unit;
      // If we have data, reload it with new units
      if (this.weatherData) {
        // Use coordinates from current weather data if available
        const { lat, lon } = this.weatherData;
        this.loadWeather(lat, lon);
      } else {
        // Default initial load - try to get location first, else default
        this.getCurrentLocation();
      }
    });

    // Setup Autocomplete
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
        // Merge with local results
        const query = this.citySearch;
        const localResults = this.weatherService.searchLocalCities(query);

        // Filter out duplicates from API
        const filteredApi = apiResults.filter(
          (apiCity) =>
            !localResults.some(
              (local) =>
                local.name.toLowerCase() === apiCity.name.toLowerCase(),
            ),
        );

        this.citySuggestions = [...localResults, ...filteredApi];
        this.showSuggestions = this.citySuggestions.length > 0;
      });
  }

  async getCurrentLocation() {
    this.loadingLocation = true;
    try {
      const position = await Geolocation.getCurrentPosition();
      this.loadWeather(position.coords.latitude, position.coords.longitude);
      this.citySearch = ''; // Clear search
    } catch (e) {
      console.error('Error getting location', e);
      // Fallback to Madrid if location fails on first load and no data
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

  // Triggered by key input
  onSearchInput(event: any) {
    const query = event.target.value;
    this.citySearch = query;
    if (query && query.length >= 2) {
      // 1. Instant Local Search
      const localResults = this.weatherService.searchLocalCities(query);
      this.citySuggestions = localResults;
      this.showSuggestions = localResults.length > 0;

      // 2. Trigger API Search (Debounced)
      if (query.length >= 3) {
        this.searchSubject.next(query);
      }
    } else {
      this.citySuggestions = [];
      this.showSuggestions = false;
    }
  }

  // Select from dropdown
  selectCity(city: any) {
    this.citySearch = city.name;
    this.showSuggestions = false;
    this.citySuggestions = []; // Clear suggestions
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
}
