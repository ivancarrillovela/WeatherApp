import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  template: `<img
    [src]="'https://openweathermap.org/img/wn/' + iconCode + '@2x.png'"
    alt="weather icon"
  />`,
  styleUrls: ['./weather-icon.component.scss'],
})
export class WeatherIconComponent {
  @Input() iconCode: string = '01d';
}
