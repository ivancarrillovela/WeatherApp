import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  template: `<img
    [src]="'https://openweathermap.org/img/wn/' + iconCode + '@2x.png'"
    alt="weather icon"
  />`,
  styles: [
    `
      img {
        width: 50px;
        height: 50px;
        filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.8));
      }
    `,
  ],
})
export class WeatherIconComponent {
  @Input() iconCode: string = '01d';
}
