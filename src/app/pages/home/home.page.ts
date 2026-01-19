```typescript
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
import { sunny, navigate } from 'ionicons/icons';
import { WeatherIconComponent } from 'src/app/components/atoms/weather-icon/weather-icon.component';
import { HourlyBreakdownComponent } => 'src/app/components/molecules/hourly-breakdown/hourly-breakdown.component';
import { ForecastListComponent } from 'src/app/components/organisms/forecast-list/forecast-list.component';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

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
  private translate = inject(TranslateService);

  weatherData: any;
  citySearch: string = '';
  currentLang: string = 'en';
  
  // Autocomplete
  searchSubject = new Subject<string>();
  citySuggestions: any[] = [];
  showSuggestions: boolean = false;

  constructor() {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    addIcons({ sunny, navigate });
  }

  ngOnInit() {
    this.loadWeather(40.4168, -3.7038); // Madrid default

    // Setup Autocomplete
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) return [];
        return this.weatherService.searchCities(query);
      })
    ).subscribe((results: any[]) => {
      this.citySuggestions = results;
      this.showSuggestions = results.length > 0;
    });
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
    this.translate.use(this.currentLang);
  }

      // Default
      this.weatherService.getWeather(51.5074, -0.1278).subscribe((data) => {
        this.weatherData = data;
      });
    }
  }

  searchCity() {
    if (!this.citySearch) return;
    this.weatherService.getWeatherByCity(this.citySearch).subscribe((data) => {
      this.weatherData = data;
    });
  }
}
