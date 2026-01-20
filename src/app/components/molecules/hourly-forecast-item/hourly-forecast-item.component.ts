import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';
import { addIcons } from 'ionicons';
import { water } from 'ionicons/icons';

@Component({
  selector: 'app-hourly-forecast-item',
  standalone: true,
  imports: [CommonModule, IonicModule, WeatherIconComponent],
  templateUrl: './hourly-forecast-item.component.html',
  styleUrls: ['./hourly-forecast-item.component.scss'],
})
export class HourlyForecastItemComponent {
  @Input() hour: any;

  constructor() {
    addIcons({ water });
  }
}
