import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';
import { addIcons } from 'ionicons';
import { water } from 'ionicons/icons';

@Component({
  selector: 'app-hourly-breakdown',
  standalone: true,
  imports: [CommonModule, IonicModule, WeatherIconComponent],
  template: `
    <div class="hourly-container">
      @for (hour of hourlyForecast; track hour.dt) {
        <div class="hour-slot glass-card ion-text-center">
          <p class="time">{{ hour.dt * 1000 | date: 'h a' }}</p>
          <div class="icon-wrapper">
            <app-weather-icon
              [iconCode]="hour.weather[0].icon"
            ></app-weather-icon>
          </div>

          <!-- Precipitación por hora (Minimalista) -->
          <div class="hourly-precip" [class.faded]="hour.pop <= 0">
            <ion-icon name="water"></ion-icon>
            <span>{{ hour.pop * 100 | number: '1.0-0' }}%</span>
          </div>

          <p class="temp">{{ hour.temp | number: '1.0-0' }}°</p>
        </div>
      }
    </div>
  `,
  styleUrls: ['./hourly-breakdown.component.scss'],
})
export class HourlyBreakdownComponent {
  @Input() hourlyForecast: any[] = [];

  constructor() {
    addIcons({ water });
  }
}
