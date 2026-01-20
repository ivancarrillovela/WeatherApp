import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';
import {
  SettingsService,
  AppLanguage,
} from 'src/app/core/services/settings.service';
import { addIcons } from 'ionicons';
import { water, navigate } from 'ionicons/icons';

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

          <div class="condition-col">
            <app-weather-icon
              [iconCode]="day.weather[0].icon"
              class="forecast-icon"
            ></app-weather-icon>

            <div class="meta-row">
              <!-- Precipitation -->
              <div
                class="meta-item"
                [style.opacity]="day.pop > 0 ? '1' : '0.3'"
              >
                <ion-icon name="water" class="rain-icon"></ion-icon>
                <span>{{ day.pop * 100 | number: '1.0-0' }}%</span>
              </div>

              <!-- Wind -->
              <div class="meta-item">
                <ion-icon
                  name="navigate"
                  class="wind-icon"
                  [style.transform]="'rotate(' + (day.wind_deg || 0) + 'deg)'"
                ></ion-icon>
                <span>{{ day.wind_speed | number: '1.0-0' }}</span>
              </div>
            </div>
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

        .condition-col {
          flex: 2; /* Dedicate more space */
          display: flex;
          flex-direction: row; /* Horizontal alignment */
          justify-content: center; /* Center the group */
          align-items: center;
          gap: 15px; /* Spacing between Icon and Meta Data */
        }

        .forecast-icon {
          font-size: 1.5rem; /* Reduced from 1.8rem */
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0.8;
          font-size: 0.75rem;
          margin-top: 0; /* Remove top margin since it's side-by-side */
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          width: 62px; /* Fixed width to align columns perfectly */
        }

        .rain-icon {
          color: #63b3ed;
          font-size: 1.5rem; /* Reduced from 1.8rem */
        }
        .wind-icon {
          color: #a0aec0;
          font-size: 1.5rem; /* Reduced from 1.8rem */
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

      @media (max-width: 768px) {
        .forecast-row {
          .condition-col {
            gap: 6px; /* Reduced gap further */
          }

          .meta-row {
            gap: 6px; /* Reduced gap further */
          }

          .meta-item {
            width: 42px; /* Further reduced width */
            font-size: 0.7rem; /* Smaller text */
          }

          .forecast-icon,
          .rain-icon,
          .wind-icon {
            font-size: 1rem; /* Even smaller icons (1rem) */
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

  constructor() {
    addIcons({ water, navigate });
  }

  ngOnInit() {
    this.settingsService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }
}
