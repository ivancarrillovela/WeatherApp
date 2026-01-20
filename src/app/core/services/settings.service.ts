import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

export type UnitSystem = 'metric' | 'imperial';
export type AppLanguage = 'en' | 'es';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private translate = inject(TranslateService);

  private currentLangSubject = new BehaviorSubject<AppLanguage>('en');
  currentLang$ = this.currentLangSubject.asObservable();

  private currentUnitSubject = new BehaviorSubject<UnitSystem>('imperial');
  currentUnit$ = this.currentUnitSubject.asObservable();

  constructor() {
    this.translate.setDefaultLang('en');
    this.setLanguage('en'); // Default
  }

  setLanguage(lang: AppLanguage) {
    this.translate.use(lang);
    this.currentLangSubject.next(lang);

    // Auto-switch units based on language convention
    // English -> Fahrenheit (imperial), Spanish -> Celsius (metric)
    if (lang === 'en') {
      this.setUnit('imperial');
    } else {
      this.setUnit('metric');
    }
  }

  setUnit(unit: UnitSystem) {
    this.currentUnitSubject.next(unit);
  }

  getCurrentLang(): AppLanguage {
    return this.currentLangSubject.value;
  }

  getCurrentUnit(): UnitSystem {
    return this.currentUnitSubject.value;
  }
}
