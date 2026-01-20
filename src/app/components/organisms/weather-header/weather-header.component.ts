import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-weather-header',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, TranslateModule],
  templateUrl: './weather-header.component.html',
  styleUrls: ['./weather-header.component.scss'],
})
export class WeatherHeaderComponent {
  @Input() citySearch: string = '';
  @Input() loadingLocation: boolean = false;
  @Input() currentLang: string = 'es';
  @Input() showSuggestions: boolean = false;
  @Input() citySuggestions: any[] = [];

  @Output() citySearchChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<void>();
  @Output() searchInput = new EventEmitter<any>();
  @Output() toggleLang = new EventEmitter<void>();
  @Output() requestLocation = new EventEmitter<void>();
  @Output() citySortSelected = new EventEmitter<any>();

  onSearchChange(value: string) {
    this.citySearch = value;
    this.citySearchChange.emit(value);
  }

  onInput(event: any) {
    this.searchInput.emit(event);
  }
}
