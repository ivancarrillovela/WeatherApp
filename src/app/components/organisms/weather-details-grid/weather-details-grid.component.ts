import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { WeatherDetailCardComponent } from '../../molecules/weather-detail-card/weather-detail-card.component';
import { StatusBadgeComponent } from '../../atoms/status-badge/status-badge.component';

@Component({
  selector: 'app-weather-details-grid',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    WeatherDetailCardComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './weather-details-grid.component.html',
  styleUrls: ['./weather-details-grid.component.scss'],
})
export class WeatherDetailsGridComponent {
  @Input() current: any;
  @Input() currentUnit: string = 'metric';

  // Ayudante para UI de Índice UV
  getUVClass(uv: number): string {
    if (!uv) return 'low';
    if (uv <= 2) return 'low';
    if (uv <= 5) return 'moderate';
    if (uv <= 7) return 'high';
    return 'extreme';
  }

  getUVColor(uv: number): string {
    if (!uv || uv <= 2) return 'success'; // Verde
    if (uv <= 5) return 'warning'; // Amarillo
    if (uv <= 7) return 'warning'; // Naranja
    return 'danger'; // Rojo
  }

  // Ayudante para UI de Nivel de Viento
  getWindStatus(speed: number): {
    key: string;
    color: string;
    cssClass: string;
    value: number;
  } {
    // Normalizar a km/h para cálculo unificado
    let kph = speed;
    if (this.currentUnit === 'imperial') {
      kph = speed * 1.60934;
    }

    // Cálculo proporcional: 100 km/h = 100% de la barra
    const value = Math.min(kph / 100, 1);

    let key = '';
    let color = '';
    let cssClass = '';

    if (kph < 20) {
      key = 'WEATHER.WIND_LEVEL.LIGHT';
      color = 'success';
      cssClass = 'low';
    } else if (kph < 40) {
      key = 'WEATHER.WIND_LEVEL.MODERATE';
      color = 'warning';
      cssClass = 'moderate';
    } else if (kph < 60) {
      key = 'WEATHER.WIND_LEVEL.STRONG';
      color = 'warning';
      cssClass = 'high';
    } else {
      key = 'WEATHER.WIND_LEVEL.VERY_STRONG';
      color = 'danger';
      cssClass = 'extreme';
    }

    return { key, color, cssClass, value };
  }
}
