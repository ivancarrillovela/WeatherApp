import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';
import { addIcons } from 'ionicons';
import { water, navigate } from 'ionicons/icons';
import { DailyForecast } from 'src/app/core/models/weather.model';

@Component({
  selector: 'app-daily-forecast-item',
  standalone: true,
  imports: [CommonModule, IonicModule, WeatherIconComponent],
  templateUrl: './daily-forecast-item.component.html',
  styleUrls: ['./daily-forecast-item.component.scss'],
})
export class DailyForecastItemComponent {
  @Input() day!: DailyForecast;
  @Input() currentLang: string = 'en';
  @Input() isActive: boolean = false;
  @Output() select = new EventEmitter<void>();

  constructor() {
    addIcons({ water, navigate });
  }

  onSelect() {
    if (!this.isActive) {
      this.select.emit();
    }
  }
}
