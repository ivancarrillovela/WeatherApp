import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HourlyForecastItemComponent } from '../../molecules/hourly-forecast-item/hourly-forecast-item.component';

@Component({
  selector: 'app-hourly-breakdown',
  standalone: true,
  imports: [CommonModule, IonicModule, HourlyForecastItemComponent],
  template: `
    <div class="hourly-container">
      @for (hour of hourlyForecast; track hour.dt) {
        <app-hourly-forecast-item [hour]="hour"></app-hourly-forecast-item>
      }
    </div>
  `,
  styleUrls: ['./hourly-breakdown.component.scss'],
})
export class HourlyBreakdownComponent {
  @Input() hourlyForecast: any[] = [];
}
