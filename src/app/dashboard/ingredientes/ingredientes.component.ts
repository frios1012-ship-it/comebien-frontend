import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { IngredienteService } from '../../core/services/ingrediente.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Ingrediente } from '../../core/models/ingrediente';

@Component({
  selector: 'app-ingredientes',
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
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './ingredientes.component.html',
  styleUrl: './ingredientes.component.scss'
})
export class IngredientesComponent implements OnInit {
  ingredientes: Ingrediente[] = [];
  filteredIngredientes: Ingrediente[] = [];
  ingredienteForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentIngredienteId: number | null = null;
  searchTerm = '';
  isAdmin = false;

  constructor(
    private ingredienteService: IngredienteService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.ingredienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      caloriasPor100g: [null, [Validators.required, Validators.min(0)]],
      proteinasPor100g: [null, [Validators.min(0)]],
      carbohidratosPor100g: [null, [Validators.min(0)]],
      grasasPor100g: [null, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.cargarIngredientes();
  }

  cargarIngredientes(): void {
    this.loading = true;
    this.ingredienteService.getAll().subscribe({
      next: (data) => {
        this.ingredientes = data;
        this.filteredIngredientes = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showError('Error al cargar los ingredientes');
      }
    });
  }

  filterIngredientes(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredIngredientes = !term
      ? this.ingredientes
      : this.ingredientes.filter(i =>
          i.nombre.toLowerCase().includes(term)
        );
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentIngredienteId = null;
    this.ingredienteForm.reset();
  }

  closeForm(): void {
    this.showForm = false;
    this.ingredienteForm.reset();
  }

  editarIngrediente(ingrediente: Ingrediente): void {
    this.showForm = true;
    this.editMode = true;
    this.currentIngredienteId = ingrediente.id || null;
    this.ingredienteForm.patchValue(ingrediente);
  }

  guardarIngrediente(): void {
    if (this.ingredienteForm.invalid) {
      this.ingredienteForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data: Ingrediente = this.ingredienteForm.value;

    const request = this.editMode && this.currentIngredienteId
      ? this.ingredienteService.update(this.currentIngredienteId, data)
      : this.ingredienteService.create(data);

    request.subscribe({
      next: () => {
        this.showSuccess(this.editMode ? 'Ingrediente actualizado' : 'Ingrediente creado');
        this.cargarIngredientes();
        this.closeForm();
        this.loading = false;
      },
      error: () => {
        this.showError('Error al guardar');
        this.loading = false;
      }
    });
  }

  confirmarEliminar(ingrediente: Ingrediente): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: {
        title: 'Eliminar Ingrediente',
        message: `¿Eliminar "${ingrediente.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((ok) => {
      if (ok && ingrediente.id) {
        this.eliminarIngrediente(ingrediente.id);
      }
    });
  }

  eliminarIngrediente(id: number): void {
    this.loading = true;
    this.ingredienteService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Ingrediente eliminado');
        this.cargarIngredientes();
        this.loading = false;
      },
      error: () => {
        this.showError('Error al eliminar');
        this.loading = false;
      }
    });
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
