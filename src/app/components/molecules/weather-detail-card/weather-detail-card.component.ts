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
        <ion-icon [name]="icon" [color]="iconColor"></ion-icon>
        <span>{{ title }}</span>
      </div>
      <div class="card-value">
        <ng-content></ng-content>
      </div>
      <div style="height: 4px;"></div>
    </div>
  `,
  styles: [
    `
      .glass-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.2s;
      }

      .detail-card {
        padding: 16px;
        height: 100%; /* Ensure full height in grid */
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;

        ion-icon {
          font-size: 1.2rem;
        }
      }

      .card-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `,
  ],
})
export class WeatherDetailCardComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() iconColor: string = 'primary';
}
