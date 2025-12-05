// src/app/dashboard/ejercicios/ejercicios.component.ts

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
import { EjercicioService } from '../../core/services/ejercicio.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Ejercicio } from '../../core/models/ejercicio';

@Component({
  selector: 'app-ejercicios',
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
  templateUrl: './ejercicios.component.html',
  styleUrl: './ejercicios.component.scss'
})
export class EjerciciosComponent implements OnInit {
  ejercicios: Ejercicio[] = [];
  filteredEjercicios: Ejercicio[] = [];
  ejercicioForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentEjercicioId: number | null = null;
  searchTerm = '';
  isAdmin = false;

  tiposEjercicio = ['Cardio', 'Fuerza', 'Flexibilidad', 'Equilibrio', 'Resistencia', 'HIIT', 'Funcional'];
  gruposMusculares = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Glúteos', 'Abdomen', 'Core', 'Full Body'];
  metricasBase = ['Repeticiones', 'Tiempo', 'Distancia', 'Peso', 'Calorías'];

  constructor(
    private ejercicioService: EjercicioService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.ejercicioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', Validators.required],
      tipo: ['', Validators.required],
      grupoMuscular: ['', Validators.required],
      metricaBase: ['', Validators.required],
      imagen: ['']
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.cargarEjercicios();
  }

  cargarEjercicios(): void {
    this.loading = true;
    this.ejercicioService.getAll().subscribe({
      next: (data: Ejercicio[]) => {
        this.ejercicios = data;
        this.filteredEjercicios = data;
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al cargar ejercicios:', err);
        this.loading = false;
        this.showError('Error al cargar los ejercicios');
      }
    });
  }

  filterEjercicios(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEjercicios = this.ejercicios;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredEjercicios = this.ejercicios.filter(e =>
      e.nombre.toLowerCase().includes(term) ||
      e.grupoMuscular.toLowerCase().includes(term) ||
      e.tipo.toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentEjercicioId = null;
    this.ejercicioForm.reset();
  }

  closeForm(): void {
    this.showForm = false;
    this.ejercicioForm.reset();
  }

  editarEjercicio(ejercicio: Ejercicio): void {
    this.showForm = true;
    this.editMode = true;
    this.currentEjercicioId = ejercicio.id || null;
    this.ejercicioForm.patchValue({
      nombre: ejercicio.nombre,
      descripcion: ejercicio.descripcion,
      tipo: ejercicio.tipo,
      grupoMuscular: ejercicio.grupoMuscular,
      metricaBase: ejercicio.metricaBase,
      imagen: ejercicio.imagen
    });
  }

  guardarEjercicio(): void {
    if (this.ejercicioForm.invalid) {
      this.ejercicioForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const ejercicioData: Ejercicio = this.ejercicioForm.value;

    if (this.editMode && this.currentEjercicioId) {
      this.ejercicioService.update(this.currentEjercicioId, ejercicioData).subscribe({
        next: () => {
          this.showSuccess('Ejercicio actualizado correctamente');
          this.cargarEjercicios();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al actualizar:', err);
          this.showError('Error al actualizar el ejercicio');
          this.loading = false;
        }
      });
    } else {
      this.ejercicioService.create(ejercicioData).subscribe({
        next: () => {
          this.showSuccess('Ejercicio creado correctamente');
          this.cargarEjercicios();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al crear:', err);
          this.showError('Error al crear el ejercicio');
          this.loading = false;
        }
      });
    }
  }

  confirmarEliminar(ejercicio: Ejercicio): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: {
        title: 'Eliminar Ejercicio',
        message: `¿Estás seguro de eliminar el ejercicio "${ejercicio.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && ejercicio.id) {
        this.eliminarEjercicio(ejercicio.id);
      }
    });
  }

  eliminarEjercicio(id: number): void {
    this.loading = true;
    this.ejercicioService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Ejercicio eliminado correctamente');
        this.cargarEjercicios();
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al eliminar:', err);
        this.showError('Error al eliminar el ejercicio');
        this.loading = false;
      }
    });
  }

  getTipoClass(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'cardio': return 'red';
      case 'fuerza': return 'blue';
      case 'flexibilidad': return 'green';
      case 'hiit': return 'orange';
      case 'resistencia': return 'purple';
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