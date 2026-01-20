import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-weather-detail-card',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="glass-card detail-card">
      <div class="card-header">
        <ion-icon
          [name]="icon"
          [color]="iconColor"
          [style.--rotation]="iconRotation + 'deg'"
          class="rotated-icon"
        ></ion-icon>
        <span>{{ title }}</span>
      </div>
      <div class="card-value">
        <ng-content></ng-content>
      </div>
      <div class="spacer-bottom"></div>
    </div>
  `,
  styleUrls: ['./weather-detail-card.component.scss'],
})
export class WeatherDetailCardComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() iconColor: string = 'primary';
  @Input() iconRotation: number = 0;
}
