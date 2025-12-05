// src/app/dashboard/favoritos/favoritos.component.ts

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
import { FavoritoService } from '../../core/services/favorito.service';
import { ListaService } from '../../core/services/lista.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Favorito } from '../../core/models/favorito';
import { Lista } from '../../core/models/lista';

@Component({
  selector: 'app-favoritos',
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
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.scss'
})
export class FavoritosComponent implements OnInit {
  favoritos: Favorito[] = [];
  filteredFavoritos: Favorito[] = [];
  listas: Lista[] = [];
  favoritoForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentFavoritoId: number | null = null;
  currentUserId: number | null = null;
  searchTerm = '';
  isAdmin = false;

  constructor(
    private favoritoService: FavoritoService,
    private listaService: ListaService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.favoritoForm = this.fb.group({
      listaId: [null, Validators.required],
      notas: ['']
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getUserId();
    this.cargarFavoritos();
    this.cargarListas();
  }

  cargarFavoritos(): void {
    this.loading = true;
    this.favoritoService.getAll().subscribe({
      next: (data: Favorito[]) => {
        this.favoritos = this.isAdmin ? data : data.filter(f => f.clienteId === this.currentUserId);
        this.filteredFavoritos = this.favoritos;
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al cargar favoritos:', err);
        this.loading = false;
        this.showError('Error al cargar los favoritos');
      }
    });
  }

  cargarListas(): void {
    this.listaService.getAll().subscribe({
      next: (data: Lista[]) => {
        this.listas = this.isAdmin ? data : data.filter(l => l.clienteId === this.currentUserId);
      },
      error: (err: Error) => {
        console.error('Error al cargar listas:', err);
      }
    });
  }

  filterFavoritos(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFavoritos = this.favoritos;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredFavoritos = this.favoritos.filter(f =>
      f.notas?.toLowerCase().includes(term) ||
      this.getListaNombre(f.listaId).toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentFavoritoId = null;
    this.favoritoForm.reset();
  }

  closeForm(): void {
    this.showForm = false;
    this.favoritoForm.reset();
  }

  editarFavorito(favorito: Favorito): void {
    this.showForm = true;
    this.editMode = true;
    this.currentFavoritoId = favorito.id || null;
    this.favoritoForm.patchValue({
      listaId: favorito.listaId,
      notas: favorito.notas
    });
  }

  guardarFavorito(): void {
    if (this.favoritoForm.invalid) {
      this.favoritoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const favoritoData: Favorito = {
      ...this.favoritoForm.value,
      clienteId: this.currentUserId
    };

    if (this.editMode && this.currentFavoritoId) {
      this.favoritoService.update(this.currentFavoritoId, favoritoData).subscribe({
        next: () => {
          this.showSuccess('Favorito actualizado correctamente');
          this.cargarFavoritos();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al actualizar:', err);
          this.showError('Error al actualizar el favorito');
          this.loading = false;
        }
      });
    } else {
      this.favoritoService.create(favoritoData).subscribe({
        next: () => {
          this.showSuccess('Favorito creado correctamente');
          this.cargarFavoritos();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al crear:', err);
          this.showError('Error al crear el favorito');
          this.loading = false;
        }
      });
    }
  }

  confirmarEliminar(favorito: Favorito): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: {
        title: 'Eliminar Favorito',
        message: `¿Estás seguro de eliminar este favorito?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && favorito.id) {
        this.eliminarFavorito(favorito.id);
      }
    });
  }

  eliminarFavorito(id: number): void {
    this.loading = true;
    this.favoritoService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Favorito eliminado correctamente');
        this.cargarFavoritos();
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al eliminar:', err);
        this.showError('Error al eliminar el favorito');
        this.loading = false;
      }
    });
  }

  getListaNombre(listaId: number | undefined): string {
    if (!listaId) return 'Sin lista';
    const lista = this.listas.find(l => l.id === listaId);
    return lista?.nombre || 'Sin lista';
  }

  formatDate(fecha: string | undefined): string {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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