import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

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
import { MatChipsModule } from '@angular/material/chips';

import { RecetaService } from '../../core/services/receta.service';
import { IngredienteService } from '../../core/services/ingrediente.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';

import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Receta } from '../../core/models/receta';
import { Ingrediente } from '../../core/models/ingrediente';
import { Cliente } from '../../core/models/cliente';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatMenuModule, MatChipsModule
  ],
  templateUrl: './recetas.component.html',
  styleUrl: './recetas.component.scss'
})
export class RecetasComponent implements OnInit {

  recetas: Receta[] = [];
  filteredRecetas: Receta[] = [];
  ingredientes: Ingrediente[] = [];
  clientes: Cliente[] = [];

  recetaForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentRecetaId: number | null = null;
  searchTerm = '';
  isAdmin = false;
  currentUserId: number | null = null;

  private isLoadingForm = false;

  constructor(
    private recetaService: RecetaService,
    private ingredienteService: IngredienteService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {

    this.recetaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      instrucciones: ['', Validators.required],
      tiempoPreparacion: [null, [Validators.required, Validators.min(1)]],
      caloriasTotales: [null, [Validators.required, Validators.min(0)]],
      imagen: [''],
      clienteId: [null],
      ingredientes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getUserId();

    this.cargarRecetas();
    this.cargarIngredientes();

    if (this.isAdmin) {
      this.cargarClientes();
      this.recetaForm.get('clienteId')?.setValidators(Validators.required);
    }
  }

  get ingredientesFormArray(): FormArray {
    return this.recetaForm.get('ingredientes') as FormArray;
  }

  cargarRecetas(): void {
    this.loading = true;
    this.recetaService.getAll().subscribe({
      next: (data) => {
        this.recetas = this.isAdmin ? data : data.filter(r => r.clienteId === this.currentUserId);
        this.filteredRecetas = this.recetas;
        this.loading = false;
      }
    });
  }

  cargarIngredientes(): void {
    this.ingredienteService.getAll().subscribe({
      next: (data) => this.ingredientes = data
    });
  }

  cargarClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes = data
    });
  }

  filterRecetas(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRecetas = this.recetas;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredRecetas = this.recetas.filter(r =>
      r.nombre.toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentRecetaId = null;

    this.recetaForm.reset();
    this.ingredientesFormArray.clear();

    this.agregarIngrediente();
  }

  closeForm(): void {
    this.showForm = false;
    this.recetaForm.reset();
    this.ingredientesFormArray.clear();
  }

  agregarIngrediente(): void {
    const group = this.fb.group({
      ingredienteId: [null, Validators.required],
      cantidad: [100, [Validators.required, Validators.min(1)]],
      unidad: ['gramos', Validators.required]
    });
    this.ingredientesFormArray.push(group);
  }

  eliminarIngredienteForm(i: number): void {
    if (this.ingredientesFormArray.length > 1) {
      this.ingredientesFormArray.removeAt(i);
    }
  }

  editarReceta(receta: Receta): void {

    if (this.isLoadingForm) return;
    this.isLoadingForm = true;

    this.showForm = true;
    this.editMode = true;
    this.currentRecetaId = receta.id ?? null;

    this.recetaForm.patchValue({
      nombre: receta.nombre,
      instrucciones: receta.instrucciones,
      tiempoPreparacion: receta.tiempoPreparacion,
      caloriasTotales: receta.caloriasTotales,
      imagen: receta.imagen,
      clienteId: receta.clienteId
    });

    this.ingredientesFormArray.clear();

    (receta.ingredientes ?? []).forEach(ing => {
      this.ingredientesFormArray.push(
        this.fb.group({
          ingredienteId: [ing.ingredienteId, Validators.required],
          cantidad: [ing.cantidad, Validators.required],
          unidad: [ing.unidad || 'gramos', Validators.required]
        })
      );
    });

    if (this.ingredientesFormArray.length === 0) {
      this.agregarIngrediente();
    }

    setTimeout(() => this.isLoadingForm = false, 300);
  }

  guardarReceta(): void {

    if (this.recetaForm.invalid) {
      this.recetaForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const recetaData: Receta = {
      ...this.recetaForm.value,
      clienteId: this.isAdmin ? this.recetaForm.value.clienteId : this.currentUserId
    };

    if (this.editMode && this.currentRecetaId) {

      this.recetaService.update(this.currentRecetaId, recetaData).subscribe({
        next: () => {
          this.showSuccess("Receta actualizada");
          this.cargarRecetas();
          this.closeForm();
          this.loading = false;
        },
        error: () => {
          this.showError("Error al actualizar");
          this.loading = false;
        }
      });

    } else {

      this.recetaService.create(recetaData).subscribe({
        next: () => {
          this.showSuccess("Receta creada");
          this.cargarRecetas();
          this.closeForm();
          this.loading = false;
        },
        error: () => {
          this.showError("Error al crear");
          this.loading = false;
        }
      });

    }
  }

  confirmarEliminar(receta: Receta): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Receta',
        message: `¿Eliminar "${receta.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && receta.id) this.eliminarReceta(receta.id);
    });
  }

  eliminarReceta(id: number): void {
    this.loading = true;
    this.recetaService.delete(id).subscribe({
      next: () => {
        this.showSuccess("Receta eliminada");
        this.cargarRecetas();
        this.loading = false;
      },
      error: () => {
        this.showError("Error al eliminar");
        this.loading = false;
      }
    });
  }

  getIngredienteNombre(id: number): string {
    return this.ingredientes.find(i => i.id === id)?.nombre || "Desconocido";
  }

  getClienteNombre(id: number): string {
    return this.clientes.find(c => c.id === id)?.nombre || "Sin asignar";
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  trackByIndex(i: number): number {
    return i;
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, "Cerrar", {
      duration: 3000,
      panelClass: ["success-snackbar"]
    });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, "Cerrar", {
      duration: 3000,
      panelClass: ["error-snackbar"]
    });
  }
}
