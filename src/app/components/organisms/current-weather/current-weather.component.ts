import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule, TranslateModule, WeatherIconComponent],
  templateUrl: './current-weather.component.html',
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
