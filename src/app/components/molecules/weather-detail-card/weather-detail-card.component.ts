import { Component, Input, ViewEncapsulation } from '@angular/core';
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
    </div>
  `,
  styles: [
    `
      /* Rely on global .glass-card for background/border/blur */

      .detail-card {
        padding: 15px; /* Match home.page.scss */
        height: 160px; /* Match home.page.scss */
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem; /* Match home.page.scss */
        opacity: 0.7; /* Match home.page.scss */
        font-weight: 600;
        text-transform: uppercase;

        ion-icon {
          font-size: 1.2rem; /* Keep icon sizing */
          opacity: 1; /* Reset opacity for icon if needed, or let inherited */
        }
      }

      .card-value {
        font-size: 2.5rem; /* Match home.page.scss */
        font-weight: 400;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        color: white; /* Ensure text is white */
      }

      /* Support projected content alignment if needed */
      :host ::ng-deep .uv-display,
      :host ::ng-deep .wind-circle {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None, // Allow styles to bleed if necessary, or just reliance on global
})
export class WeatherDetailCardComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() iconColor: string = 'primary';
}
