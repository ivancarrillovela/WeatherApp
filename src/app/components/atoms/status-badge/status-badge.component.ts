import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="colorClass">
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      .badge {
        padding: 2px 5px;
        border-radius: 8px;
        font-size: 0.6rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        white-space: nowrap;

        @media (min-width: 768px) {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
        }

        &.low,
        &.success {
          background-color: var(--ion-color-success);
        }

        &.moderate,
        &.warning {
          background-color: var(--ion-color-warning);
          color: black;
        }

        &.high,
        &.danger,
        &.extreme {
          background-color: var(--ion-color-danger);
        }
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() colorClass: string = 'low';
}
