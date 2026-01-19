import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Format date
import { IonicModule } from '@ionic/angular'; // Need setup for standalone if not importing specifics? Better to import IonCard etc.
import { IonCard, IonCardContent, IonLabel } from '@ionic/angular/standalone';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';

@Component({
  selector: 'app-hourly-breakdown',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonLabel,
    WeatherIconComponent,
  ],
  template: `
    <div class="hourly-container">
      @for (hour of hourlyForecast; track hour.dt) {
        <ion-card class="hour-card">
          <ion-card-content class="ion-text-center">
            <ion-label>
              <p>{{ hour.dt * 1000 | date: 'h a' }}</p>
            </ion-label>
            <app-weather-icon
              [iconCode]="hour.weather[0].icon"
            ></app-weather-icon>
            <ion-label>
              <h3>{{ hour.temp | number: '1.0-0' }}°</h3>
            </ion-label>
          </ion-card-content>
        </ion-card>
      }
    </div>
  `,
  styles: [
    `
      .hourly-container {
        display: flex;
        overflow-x: auto;
        padding-bottom: 10px;
      }
      .hour-card {
        min-width: 80px;
        margin-right: 10px;
        --background: rgba(255, 255, 255, 0.1);
      }
    `,
  ],
})
export class HourlyBreakdownComponent {
  @Input() hourlyForecast: any[] = [];
}
