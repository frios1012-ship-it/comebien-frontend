// src/app/dashboard/calificaciones/calificaciones.component.ts

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
import { CalificacionService } from '../../core/services/calificacion.service';
import { RecetaService } from '../../core/services/receta.service';
// <CHANGE> Importar ListaService
import { ListaService } from '../../core/services/lista.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Calificacion } from '../../core/models/calificacion';
import { Receta } from '../../core/models/receta';
// <CHANGE> Importar modelo Lista
import { Lista } from '../../core/models/lista';

@Component({
  selector: 'app-calificaciones',
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
  templateUrl: './calificaciones.component.html',
  styleUrl: './calificaciones.component.scss'
})
export class CalificacionesComponent implements OnInit {
  calificaciones: Calificacion[] = [];
  filteredCalificaciones: Calificacion[] = [];
  recetas: Receta[] = [];
  // <CHANGE> Agregar array de listas
  listas: Lista[] = [];
  calificacionForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentCalificacionId: number | null = null;
  currentUserId: number | null = null;
  searchTerm = '';
  isAdmin = false;

  constructor(
    private calificacionService: CalificacionService,
    private recetaService: RecetaService,
    // <CHANGE> Inyectar ListaService
    private listaService: ListaService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // <CHANGE> Agregar listaId al formulario
    this.calificacionForm = this.fb.group({
      recetaId: [null, Validators.required],
      listaId: [null],
      puntaje: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['']
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getUserId();
    this.cargarCalificaciones();
    this.cargarRecetas();
    // <CHANGE> Cargar listas
    this.cargarListas();
  }

  cargarCalificaciones(): void {
    this.loading = true;
    this.calificacionService.getAll().subscribe({
      next: (data: Calificacion[]) => {
        this.calificaciones = this.isAdmin ? data : data.filter(c => c.clienteId === this.currentUserId);
        this.filteredCalificaciones = this.calificaciones;
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al cargar calificaciones:', err);
        this.loading = false;
        this.showError('Error al cargar las calificaciones');
      }
    });
  }

  cargarRecetas(): void {
    this.recetaService.getAll().subscribe({
      next: (data: Receta[]) => {
        this.recetas = data;
      },
      error: (err: Error) => {
        console.error('Error al cargar recetas:', err);
      }
    });
  }

  // <CHANGE> Método para cargar listas
  cargarListas(): void {
    this.listaService.getAll().subscribe({
      next: (data: Lista[]) => {
        // Filtrar solo las listas del usuario actual si no es admin
        this.listas = this.isAdmin ? data : data.filter(l => l.clienteId === this.currentUserId);
      },
      error: (err: Error) => {
        console.error('Error al cargar listas:', err);
      }
    });
  }

  filterCalificaciones(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCalificaciones = this.calificaciones;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCalificaciones = this.calificaciones.filter(c =>
      c.comentario?.toLowerCase().includes(term) ||
      this.getRecetaNombre(c.recetaId).toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentCalificacionId = null;
    this.calificacionForm.reset({ puntaje: 5 });
  }

  closeForm(): void {
    this.showForm = false;
    this.calificacionForm.reset();
  }

  editarCalificacion(calificacion: Calificacion): void {
    this.showForm = true;
    this.editMode = true;
    this.currentCalificacionId = calificacion.id || null;
    this.calificacionForm.patchValue({
      recetaId: calificacion.recetaId,
      // <CHANGE> Cargar listaId al editar
      listaId: calificacion.listaId || null,
      puntaje: calificacion.puntaje,
      comentario: calificacion.comentario
    });
  }

  guardarCalificacion(): void {
    if (this.calificacionForm.invalid) {
      this.calificacionForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    // <CHANGE> Incluir listaId en los datos enviados
    const calificacionData: Calificacion = {
      ...this.calificacionForm.value,
      clienteId: this.currentUserId
    };

    if (this.editMode && this.currentCalificacionId) {
      this.calificacionService.update(this.currentCalificacionId, calificacionData).subscribe({
        next: () => {
          this.showSuccess('Calificación actualizada correctamente');
          this.cargarCalificaciones();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al actualizar:', err);
          this.showError('Error al actualizar la calificación');
          this.loading = false;
        }
      });
    } else {
      this.calificacionService.create(calificacionData).subscribe({
        next: () => {
          this.showSuccess('Calificación creada correctamente');
          this.cargarCalificaciones();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al crear:', err);
          this.showError('Error al crear la calificación');
          this.loading = false;
        }
      });
    }
  }

  confirmarEliminar(calificacion: Calificacion): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: {
        title: 'Eliminar Calificación',
        message: `¿Estás seguro de eliminar esta calificación?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && calificacion.id) {
        this.eliminarCalificacion(calificacion.id);
      }
    });
  }

  eliminarLista(id: number): void {
    this.loading = true;
    this.calificacionService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Calificación eliminada correctamente');
        this.cargarCalificaciones();
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al eliminar:', err);
        this.showError('Error al eliminar la calificación');
        this.loading = false;
      }
    });
  }

  eliminarCalificacion(id: number): void {
    this.loading = true;
    this.calificacionService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Calificación eliminada correctamente');
        this.cargarCalificaciones();
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al eliminar:', err);
        this.showError('Error al eliminar la calificación');
        this.loading = false;
      }
    });
  }

  getRecetaNombre(recetaId: number | undefined): string {
    if (!recetaId) return 'Sin receta';
    const receta = this.recetas.find(r => r.id === recetaId);
    return receta?.nombre || 'Sin receta';
  }

  // <CHANGE> Método para obtener nombre de lista
  getListaNombre(listaId: number | undefined): string {
    if (!listaId) return 'Sin lista';
    const lista = this.listas.find(l => l.id === listaId);
    return lista?.nombre || 'Sin lista';
  }

  getStars(puntaje: number): number[] {
    return Array(5).fill(0).map((_, i) => i < puntaje ? 1 : 0);
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