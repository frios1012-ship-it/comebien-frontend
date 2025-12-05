// src/app/dashboard/rutinas/rutinas.component.ts

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
import { RutinaService } from '../../core/services/rutina.service';
// <CHANGE> Importar ListaService
import { ListaService } from '../../core/services/lista.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Rutina } from '../../core/models/rutina';
// <CHANGE> Importar modelo Lista
import { Lista } from '../../core/models/lista';

@Component({
  selector: 'app-rutinas',
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
  templateUrl: './rutinas.component.html',
  styleUrl: './rutinas.component.scss'
})
export class RutinasComponent implements OnInit {
  rutinas: Rutina[] = [];
  filteredRutinas: Rutina[] = [];
  // <CHANGE> Agregar array de listas
  listas: Lista[] = [];
  rutinaForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentRutinaId: number | null = null;
  searchTerm = '';
  isAdmin = false;

  niveles = ['Principiante', 'Intermedio', 'Avanzado'];
  objetivos = ['Perdida de peso', 'Ganancia muscular', 'Resistencia', 'Flexibilidad', 'Mantenimiento'];

  constructor(
    private rutinaService: RutinaService,
    // <CHANGE> Inyectar ListaService
    private listaService: ListaService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // <CHANGE> Agregar listaId al formulario
    this.rutinaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      objetivo: ['', Validators.required],
      nivel: ['', Validators.required],
      duracionTotal: [null, [Validators.required, Validators.min(1)]],
      imagen: [''],
      listaId: [null]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.cargarRutinas();
    // <CHANGE> Cargar listas
    this.cargarListas();
  }

  cargarRutinas(): void {
    this.loading = true;
    this.rutinaService.getAll().subscribe({
      next: (data: Rutina[]) => {
        this.rutinas = data;
        this.filteredRutinas = data;
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al cargar rutinas:', err);
        this.loading = false;
        this.showError('Error al cargar las rutinas');
      }
    });
  }

  // <CHANGE> Método para cargar listas
  cargarListas(): void {
    this.listaService.getAll().subscribe({
      next: (data: Lista[]) => {
        this.listas = data;
      },
      error: (err: Error) => {
        console.error('Error al cargar listas:', err);
      }
    });
  }

  filterRutinas(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRutinas = this.rutinas;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredRutinas = this.rutinas.filter(r =>
      r.nombre.toLowerCase().includes(term) ||
      r.objetivo.toLowerCase().includes(term) ||
      r.nivel.toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentRutinaId = null;
    this.rutinaForm.reset();
  }

  closeForm(): void {
    this.showForm = false;
    this.rutinaForm.reset();
  }

  editarRutina(rutina: Rutina): void {
    this.showForm = true;
    this.editMode = true;
    this.currentRutinaId = rutina.id || null;
    this.rutinaForm.patchValue({
      nombre: rutina.nombre,
      objetivo: rutina.objetivo,
      nivel: rutina.nivel,
      duracionTotal: rutina.duracionTotal,
      imagen: rutina.imagen,
      // <CHANGE> Cargar listaId al editar
      listaId: rutina.listaId || null
    });
  }

  guardarRutina(): void {
    if (this.rutinaForm.invalid) {
      this.rutinaForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    // <CHANGE> Incluir listaId en los datos enviados
    const rutinaData: Rutina = this.rutinaForm.value;

    if (this.editMode && this.currentRutinaId) {
      this.rutinaService.update(this.currentRutinaId, rutinaData).subscribe({
        next: () => {
          this.showSuccess('Rutina actualizada correctamente');
          this.cargarRutinas();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al actualizar:', err);
          this.showError('Error al actualizar la rutina');
          this.loading = false;
        }
      });
    } else {
      this.rutinaService.create(rutinaData).subscribe({
        next: () => {
          this.showSuccess('Rutina creada correctamente');
          this.cargarRutinas();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al crear:', err);
          this.showError('Error al crear la rutina');
          this.loading = false;
        }
      });
    }
  }

  confirmarEliminar(rutina: Rutina): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: {
        title: 'Eliminar Rutina',
        message: `¿Estás seguro de eliminar la rutina "${rutina.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && rutina.id) {
        this.eliminarRutina(rutina.id);
      }
    });
  }

  eliminarRutina(id: number): void {
    this.loading = true;
    this.rutinaService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Rutina eliminada correctamente');
        this.cargarRutinas();
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al eliminar:', err);
        this.showError('Error al eliminar la rutina');
        this.loading = false;
      }
    });
  }

  getNivelClass(nivel: string): string {
    switch (nivel.toLowerCase()) {
      case 'principiante': return 'green';
      case 'intermedio': return 'yellow';
      case 'avanzado': return 'red';
      default: return '';
    }
  }

  getObjetivoIcon(objetivo: string): string {
    switch (objetivo.toLowerCase()) {
      case 'perdida de peso': return 'fitness_center';
      case 'ganancia muscular': return 'sports_gymnastics';
      case 'resistencia': return 'directions_run';
      case 'flexibilidad': return 'self_improvement';
      case 'mantenimiento': return 'balance';
      default: return 'sports';
    }
  }

  // <CHANGE> Método para obtener nombre de lista
  getListaNombre(listaId: number | undefined): string {
    if (!listaId) return 'Sin lista';
    const lista = this.listas.find(l => l.id === listaId);
    return lista?.nombre || 'Sin lista';
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