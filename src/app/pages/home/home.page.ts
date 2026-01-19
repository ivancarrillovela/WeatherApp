import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../core/services/weather.service'; // Adjusted path
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ForecastListComponent } from '../../components/organisms/forecast-list/forecast-list.component';
import { WeatherIconComponent } from '../../components/atoms/weather-icon/weather-icon.component';
import { HourlyBreakdownComponent } from '../../components/molecules/hourly-breakdown/hourly-breakdown.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    ForecastListComponent,
    WeatherIconComponent,
    HourlyBreakdownComponent,
  ],
})
export class HomePage implements OnInit {
  private weatherService = inject(WeatherService);
  private translate = inject(TranslateService);

  weatherData: any = null;
  currentLang = 'en';
  citySearch = '';

  ngOnInit() {
    this.translate.setDefaultLang('en');
    this.loadCurrentLocation();
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
    this.translate.use(this.currentLang);
  }

  loadCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.weatherService
            .getWeather(latitude, longitude)
            .subscribe((data) => {
              this.weatherData = data;
            });
        },
        (err) => {
          console.error('Geolocation error', err);
          // Default to London if geo fails or denied
          this.weatherService.getWeather(51.5074, -0.1278).subscribe((data) => {
            this.weatherData = data;
          });
        },
      );
    } else {
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
