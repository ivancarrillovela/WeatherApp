import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `<ng-content></ng-content>`,
  styleUrls: ['./section-title.component.scss'],
})
export class SectionTitleComponent {}
