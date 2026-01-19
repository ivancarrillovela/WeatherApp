import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forecast-list',
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonLabel,
    IonAccordionGroup,
    IonAccordion,
    TranslateModule,
  ],
  template: `
    <ion-accordion-group>
      @for (day of dailyForecast; track day.dt) {
        <ion-accordion [value]="day.dt">
          <ion-item slot="header" color="light">
            <ion-label>
              <h2>{{ day.dt * 1000 | date: 'EEEE' }}</h2>
              <p>{{ day.weather[0].description }}</p>
            </ion-label>
            <div slot="end">
              {{ day.temp.max | number: '1.0-0' }}° /
              {{ day.temp.min | number: '1.0-0' }}°
            </div>
          </ion-item>
          <div slot="content" class="ion-padding">
            <p>{{ 'WEATHER.UV' | translate }}: {{ day.uvi }}</p>
            <p>{{ 'WEATHER.RAIN' | translate }}: {{ day.rain || 0 }}mm</p>
            <p>{{ 'WEATHER.HUMIDITY' | translate }}: {{ day.humidity }}%</p>
          </div>
        </ion-accordion>
      }
    </ion-accordion-group>
  `,
})
export class ForecastListComponent {
  @Input() dailyForecast: any[] = [];
}
