// src/app/dashboard/ejercicios-rutina/ejercicios-rutina.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { EjercicioRutinaService } from '../../core/services/ejercicio-rutina.service';
import { RutinaService } from '../../core/services/rutina.service';
import { EjercicioService } from '../../core/services/ejercicio.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { EjercicioRutina } from '../../core/models/ejercicio-rutina';
import { Rutina } from '../../core/models/rutina';
import { Ejercicio } from '../../core/models/ejercicio';

@Component({
  selector: 'app-ejercicios-rutina',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './ejercicios-rutina.component.html',
  styleUrl: './ejercicios-rutina.component.scss'
})
export class EjerciciosRutinaComponent implements OnInit {
  ejerciciosRutina: EjercicioRutina[] = [];
  filteredEjerciciosRutina: EjercicioRutina[] = [];
  rutinas: Rutina[] = [];
  ejercicios: Ejercicio[] = [];
  
  ejercicioRutinaForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentId: number | null = null;
  searchTerm = '';
  isAdmin = false;

  intensidades = ['Baja', 'Media', 'Alta', 'Muy Alta'];

  constructor(
    private ejercicioRutinaService: EjercicioRutinaService,
    private rutinaService: RutinaService,
    private ejercicioService: EjercicioService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.ejercicioRutinaForm = this.fb.group({
      rutinaId: [null, Validators.required],
      ejercicioId: [null, Validators.required],
      orden: [1, [Validators.required, Validators.min(1)]],
      series: [3, [Validators.required, Validators.min(1)]],
      repeticiones: [10, [Validators.required, Validators.min(1)]],
      duracionSeg: [0, [Validators.min(0)]],
      intensidad: ['Media', Validators.required],
      tiempo: ['']
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.cargarDatos();
    this.cargarRutinas();
    this.cargarEjercicios();
  }

  cargarDatos(): void {
    this.loading = true;
    this.ejercicioRutinaService.getAll().subscribe({
      next: (data: EjercicioRutina[]) => {
        this.ejerciciosRutina = data;
        this.filteredEjerciciosRutina = data;
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al cargar:', err);
        this.loading = false;
        this.showError('Error al cargar los ejercicios de rutina');
      }
    });
  }

  cargarRutinas(): void {
    this.rutinaService.getAll().subscribe({
      next: (data: Rutina[]) => {
        this.rutinas = data;
      },
      error: (err: Error) => {
        console.error('Error al cargar rutinas:', err);
      }
    });
  }

  cargarEjercicios(): void {
    this.ejercicioService.getAll().subscribe({
      next: (data: Ejercicio[]) => {
        this.ejercicios = data;
      },
      error: (err: Error) => {
        console.error('Error al cargar ejercicios:', err);
      }
    });
  }

  filterData(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEjerciciosRutina = this.ejerciciosRutina;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredEjerciciosRutina = this.ejerciciosRutina.filter(er =>
      er.ejercicioNombre?.toLowerCase().includes(term) ||
      this.getRutinaNombre(er.rutinaId).toLowerCase().includes(term) ||
      er.intensidad.toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentId = null;
    this.ejercicioRutinaForm.reset({
      orden: 1,
      series: 3,
      repeticiones: 10,
      duracionSeg: 0,
      intensidad: 'Media'
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.ejercicioRutinaForm.reset();
  }

  editar(item: EjercicioRutina): void {
    this.showForm = true;
    this.editMode = true;
    this.currentId = item.id || null;
    this.ejercicioRutinaForm.patchValue({
      rutinaId: item.rutinaId,
      ejercicioId: item.ejercicioId,
      orden: item.orden,
      series: item.series,
      repeticiones: item.repeticiones,
      duracionSeg: item.duracionSeg,
      intensidad: item.intensidad,
      tiempo: item.tiempo
    });
  }

  guardar(): void {
    if (this.ejercicioRutinaForm.invalid) {
      this.ejercicioRutinaForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data: EjercicioRutina = this.ejercicioRutinaForm.value;

    if (this.editMode && this.currentId) {
      this.ejercicioRutinaService.update(this.currentId, data).subscribe({
        next: () => {
          this.showSuccess('Actualizado correctamente');
          this.cargarDatos();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al actualizar:', err);
          this.showError('Error al actualizar');
          this.loading = false;
        }
      });
    } else {
      this.ejercicioRutinaService.create(data).subscribe({
        next: () => {
          this.showSuccess('Creado correctamente');
          this.cargarDatos();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al crear:', err);
          this.showError('Error al crear');
          this.loading = false;
        }
      });
    }
  }

  confirmarEliminar(item: EjercicioRutina): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: {
        title: 'Eliminar Ejercicio de Rutina',
        message: `¿Estás seguro de eliminar "${item.ejercicioNombre}" de esta rutina?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && item.id) {
        this.eliminar(item.id);
      }
    });
  }

  eliminar(id: number): void {
    this.loading = true;
    this.ejercicioRutinaService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Eliminado correctamente');
        this.cargarDatos();
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al eliminar:', err);
        this.showError('Error al eliminar');
        this.loading = false;
      }
    });
  }

  getRutinaNombre(rutinaId: number | undefined): string {
    if (!rutinaId) return 'Sin rutina';
    const rutina = this.rutinas.find(r => r.id === rutinaId);
    return rutina?.nombre || 'Sin rutina';
  }

  getEjercicioNombre(ejercicioId: number | undefined): string {
    if (!ejercicioId) return 'Sin ejercicio';
    const ejercicio = this.ejercicios.find(e => e.id === ejercicioId);
    return ejercicio?.nombre || 'Sin ejercicio';
  }

  getIntensidadClass(intensidad: string): string {
    switch (intensidad.toLowerCase()) {
      case 'baja': return 'green';
      case 'media': return 'yellow';
      case 'alta': return 'orange';
      case 'muy alta': return 'red';
      default: return '';
    }
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}