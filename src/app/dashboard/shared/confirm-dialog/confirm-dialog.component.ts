import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header" [ngClass]="data.type || 'danger'">
        <div class="icon-wrapper">
          <mat-icon>{{ getIcon() }}</mat-icon>
        </div>
      </div>
      
      <div class="dialog-content">
        <h2>{{ data.title }}</h2>
        <p>{{ data.message }}</p>
      </div>
      
      <div class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()" class="cancel-btn">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button 
          mat-raised-button 
          [ngClass]="data.type || 'danger'"
          (click)="onConfirm()" 
          class="confirm-btn">
          <mat-icon>{{ getConfirmIcon() }}</mat-icon>
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      background: #12121A;
      border-radius: 20px;
      overflow: hidden;
      min-width: 360px;
    }

    .dialog-header {
      padding: 24px;
      display: flex;
      justify-content: center;
      
      &.danger {
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.05) 100%);
        
        .icon-wrapper {
          background: linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%);
        }
      }
      
      &.warning {
        background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 193, 7, 0.05) 100%);
        
        .icon-wrapper {
          background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
        }
      }
      
      &.info {
        background: linear-gradient(135deg, rgba(0, 217, 165, 0.2) 0%, rgba(0, 217, 165, 0.05) 100%);
        
        .icon-wrapper {
          background: linear-gradient(135deg, #00D9A5 0%, #00B4D8 100%);
        }
      }
      
      .icon-wrapper {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: white;
        }
      }
    }

    .dialog-content {
      padding: 24px;
      text-align: center;
      
      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #FFFFFF;
        margin: 0 0 8px 0;
      }
      
      p {
        font-size: 0.95rem;
        color: #A0A0B0;
        margin: 0;
        line-height: 1.5;
      }
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      padding: 16px 24px 24px;
      justify-content: center;
      
      button {
        min-width: 120px;
        height: 44px;
        border-radius: 10px;
        font-weight: 500;
      }
      
      .cancel-btn {
        border-color: #2A2A3A;
        color: #A0A0B0;
        
        &:hover {
          background: #1A1A25;
          border-color: #3A3A4A;
        }
      }
      
      .confirm-btn {
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-right: 6px;
        }
        
        &.danger {
          background: linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%);
          color: white;
        }
        
        &.warning {
          background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
          color: #1A1A25;
        }
        
        &.info {
          background: linear-gradient(135deg, #00D9A5 0%, #00B4D8 100%);
          color: #1A1A25;
        }
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'delete_forever';
    }
  }

  getConfirmIcon(): string {
    switch (this.data.type) {
      case 'warning': return 'check';
      case 'info': return 'check';
      default: return 'delete';
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}