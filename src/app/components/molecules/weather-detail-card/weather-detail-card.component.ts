import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-weather-detail-card',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './weather-detail-card.component.html',
  styleUrls: ['./weather-detail-card.component.scss'],
})
export class WeatherDetailCardComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() iconColor: string = 'primary';
  @Input() iconRotation: number = 0;
}
