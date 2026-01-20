import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WeatherIconComponent } from '../../atoms/weather-icon/weather-icon.component';
import { addIcons } from 'ionicons';
import { water } from 'ionicons/icons';

@Component({
  selector: 'app-hourly-breakdown',
  standalone: true,
  imports: [CommonModule, IonicModule, WeatherIconComponent],
  template: `
    <div class="hourly-container">
      @for (hour of hourlyForecast; track hour.dt) {
        <div class="hour-slot glass-card ion-text-center">
          <p class="time">{{ hour.dt * 1000 | date: 'h a' }}</p>
          <div class="icon-wrapper">
            <app-weather-icon
              [iconCode]="hour.weather[0].icon"
            ></app-weather-icon>
          </div>

          <!-- Precipitación Hourly (Minimalist) -->
          <div class="hourly-precip" [style.opacity]="hour.pop > 0 ? 1 : 0.3">
            <ion-icon name="water"></ion-icon>
            <span>{{ hour.pop * 100 | number: '1.0-0' }}%</span>
          </div>

          <p class="temp">{{ hour.temp | number: '1.0-0' }}°</p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .hourly-container {
        display: flex;
        overflow-x: auto;
        padding-bottom: 20px;
        gap: 12px;

        /* Ocultar barra de desplazamiento */
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .hour-slot {
        min-width: 70px;
        padding: 15px 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        /* Sobrescribir glass-card específico para items pequeños si es necesario */
        border-radius: 30px; /* Forma de píldora */
        background: rgba(
          255,
          255,
          255,
          0.05
        ); /* Ligeramente más transparente */
        box-shadow: none; /* Eliminar sombra dura */
        border: 1px solid rgba(255, 255, 255, 0.05); /* Borde más suave */

        .time {
          font-size: 0.8rem;
          margin: 0 0 10px 0;
          opacity: 0.8;
        }

        .icon-wrapper {
          margin-bottom: 2px; /* Reduced margin to fit precip */
          font-size: 1.5rem; /* Controlar tamaño del icono */
        }

        .hourly-precip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          font-size: 0.7rem;
          color: #90cdf4;
          margin-bottom: 8px;
          height: 15px; /* Fixed height to keep alignment */

          ion-icon {
            font-size: 0.7rem;
          }
        }

        .temp {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }
      }
    `,
  ],
})
export class HourlyBreakdownComponent {
  @Input() hourlyForecast: any[] = [];

  constructor() {
    addIcons({ water });
  }
}
