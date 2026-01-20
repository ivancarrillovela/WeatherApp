import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';
import {
  SettingsService,
  AppLanguage,
} from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-forecast-list',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule, WeatherIconComponent],
  template: `
    <div class="forecast-container glass-card">
      @for (day of dailyForecast; track day.dt) {
        <div class="forecast-row">
          <div class="day-name">
            {{ day.dt * 1000 | date: 'EEEE' : undefined : currentLang }}
          </div>

          <div class="condition">
            <app-weather-icon
              [iconCode]="day.weather[0].icon"
              style="font-size: 1.5rem; vertical-align: middle;"
            ></app-weather-icon>
            <span class="precip" *ngIf="day.pop > 0"
              >{{ day.pop * 100 | number: '1.0-0' }}%</span
            >
          </div>

          <div class="temps">
            <span class="high">{{ day.temp.max | number: '1.0-0' }}°</span>
            <span class="low">{{ day.temp.min | number: '1.0-0' }}°</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .forecast-container {
        padding: 10px 20px;
        /* Reuse glass-card but maybe less padding or specific adjustments */
      }

      .forecast-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        &:last-child {
          border-bottom: none;
        }

        .day-name {
          flex: 1;
          font-weight: 500;
          font-size: 1rem;
          text-transform: capitalize;
        }

        .condition {
          flex: 1;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;

          .precip {
            font-size: 0.75rem;
            color: #90cdf4; /* Light blue for rain */
          }
        }

        .temps {
          flex: 1;
          text-align: right;

          .high {
            font-weight: 600;
            font-size: 1rem;
            margin-right: 10px;
          }
          .low {
            font-weight: 400;
            opacity: 0.6;
            font-size: 1rem;
          }
        }
      }
    `,
  ],
})
export class ForecastListComponent implements OnInit {
  @Input() dailyForecast: any[] = [];

  private settingsService = inject(SettingsService);
  currentLang: AppLanguage = 'en';

  ngOnInit() {
    this.settingsService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }
}
