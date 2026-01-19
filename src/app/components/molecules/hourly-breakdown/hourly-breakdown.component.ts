import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';

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
          <p class="temp">{{ hour.temp | number: '1.0-0' }}°</p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .hourly-container {
        display: flex;
        overflow-x: auto;
        padding-bottom: 20px;
        gap: 12px;

        /* Hide Scrollbar */
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .hour-slot {
        min-width: 70px;
        padding: 15px 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        /* Overwrite glass-card specific for small items if needed */
        border-radius: 30px; /* Pill shape */
        background: rgba(255, 255, 255, 0.05); /* Slightly more transparent */

        .time {
          font-size: 0.8rem;
          margin: 0 0 10px 0;
          opacity: 0.8;
        }

        .icon-wrapper {
          margin-bottom: 10px;
          font-size: 1.5rem; /* Control icon size */
        }

        .temp {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }
      }
    `,
  ],
})
export class HourlyBreakdownComponent {
  @Input() hourlyForecast: any[] = [];
}
