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
import { DailyForecastItemComponent } from '../../molecules/daily-forecast-item/daily-forecast-item.component';
import {
  SettingsService,
  AppLanguage,
} from 'src/app/core/services/settings.service';
import { DailyForecast } from 'src/app/core/models/weather.model';

@Component({
  selector: 'app-forecast-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    DailyForecastItemComponent,
  ],
  template: `
    <div class="forecast-container glass-card">
      @for (day of dailyForecast; track day.dt; let i = $index) {
        <app-daily-forecast-item
          class="forecast-item"
          [day]="day"
          [currentLang]="currentLang"
          [isActive]="
            selectedDayId === day.dt || (selectedDayId === null && i === 0)
          "
          (select)="selectDay(day, i)"
        ></app-daily-forecast-item>
      }
    </div>
  `,
  styleUrls: ['./forecast-list.component.scss'],
})
export class ForecastListComponent implements OnInit {
  @Input() dailyForecast: DailyForecast[] = [];
  @Input() selectedDayId: number | null = null;
  @Output() daySelected = new EventEmitter<DailyForecast>();

  private settingsService = inject(SettingsService);
  currentLang: AppLanguage = 'en';

  constructor() {}

  ngOnInit() {
    this.settingsService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  selectDay(day: DailyForecast, index: number) {
    if (
      this.selectedDayId === day.dt ||
      (this.selectedDayId === null && index === 0)
    ) {
      return;
    }
    this.daySelected.emit(day);
  }
}
