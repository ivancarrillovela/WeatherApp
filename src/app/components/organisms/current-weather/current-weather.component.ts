import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule, TranslateModule, WeatherIconComponent],
  template: `
    <div class="hero-section ion-text-center">
      <!-- Dynamic Date Title -->
      <h3 class="date-title">
        @if (!displayDate) {
          {{ 'HOME.TODAY' | translate }}
        } @else {
          {{
            displayDate * 1000
              | date: 'EEEE, d MMMM' : undefined : currentLang
              | titlecase
          }}
        }
      </h3>

      <h2 class="city-name">
        {{ locationName }}
      </h2>
      <div class="temperature-container">
        <h1 class="main-temp">{{ temp | number: '1.0-0' }}°</h1>
      </div>

      <div class="condition-container">
        <app-weather-icon
          [iconCode]="iconCode"
          class="hero-icon"
        ></app-weather-icon>
        <span class="condition-text">
          {{ description | titlecase }}
        </span>
      </div>

      <div class="high-low">
        {{ 'WEATHER.HIGH' | translate }}: {{ tempMax | number: '1.0-0' }}° |
        {{ 'WEATHER.LOW' | translate }}: {{ tempMin | number: '1.0-0' }}°
      </div>
    </div>
  `,
  styleUrls: ['./current-weather.component.scss'],
})
export class CurrentWeatherComponent {
  @Input() displayDate: number | null = null;
  @Input() currentLang: string = 'en';
  @Input() locationName: string = '';
  @Input() temp: number = 0;
  @Input() tempMax: number = 0;
  @Input() tempMin: number = 0;
  @Input() iconCode: string = '';
  @Input() description: string = '';
}
