import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
} from '@angular/core';
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
      @for (day of dailyForecast; track day.dt; let i = $index) {
        <div class="forecast-item">
          <div
            class="forecast-row"
            [class.active]="
              selectedDayId === day.dt || (selectedDayId === null && i === 0)
            "
            (click)="selectDay(day, i)"
          >
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
        </div>
      }
    </div>
  `,
  styleUrls: ['./forecast-list.component.scss'],
})
export class ForecastListComponent implements OnInit {
  @Input() dailyForecast: any[] = [];
  @Input() selectedDayId: number | null = null;
  @Output() daySelected = new EventEmitter<any>();

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

  selectDay(day: any, index: number) {
    // If active check (redundant with pointer-events but safe)
    if (
      this.selectedDayId === day.dt ||
      (this.selectedDayId === null && index === 0)
    ) {
      return;
    }
    this.daySelected.emit(day);
  }
}
