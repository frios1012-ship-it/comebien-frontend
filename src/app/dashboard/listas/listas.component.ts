// src/app/dashboard/listas/listas.component.ts

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
import { ListaService } from '../../core/services/lista.service';
import { ClienteService } from '../../core/services/cliente.service';
// <CHANGE> Importar servicios de Receta y Rutina
import { RecetaService } from '../../core/services/receta.service';
import { RutinaService } from '../../core/services/rutina.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Lista } from '../../core/models/lista';
import { Cliente } from '../../core/models/cliente';
// <CHANGE> Importar modelos de Receta y Rutina
import { Receta } from '../../core/models/receta';
import { Rutina } from '../../core/models/rutina';

@Component({
  selector: 'app-listas',
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
  templateUrl: './listas.component.html',
  styleUrl: './listas.component.scss'
})
export class ListasComponent implements OnInit {
  listas: Lista[] = [];
  filteredListas: Lista[] = [];
  clientes: Cliente[] = [];
  // <CHANGE> Agregar arrays para recetas y rutinas
  recetas: Receta[] = [];
  rutinas: Rutina[] = [];
  
  listaForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentListaId: number | null = null;
  currentUserId: number | null = null;
  searchTerm = '';
  isAdmin = false;

  constructor(
    private listaService: ListaService,
    private clienteService: ClienteService,
    // <CHANGE> Inyectar servicios de Receta y Rutina
    private recetaService: RecetaService,
    private rutinaService: RutinaService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // <CHANGE> Agregar recetaId y rutinaId al formulario
    this.listaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      clienteId: [null],
      recetaId: [null],
      rutinaId: [null]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getUserId();
    
    if (this.isAdmin) {
      this.listaForm.get('clienteId')?.setValidators([Validators.required]);
      this.cargarClientes();
    }
    
    this.cargarListas();
    // <CHANGE> Cargar recetas y rutinas
    this.cargarRecetas();
    this.cargarRutinas();
  }

  cargarListas(): void {
    this.loading = true;
    this.listaService.getAll().subscribe({
      next: (data: Lista[]) => {
        this.listas = this.isAdmin ? data : data.filter(l => l.clienteId === this.currentUserId);
        this.filteredListas = this.listas;
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al cargar listas:', err);
        this.loading = false;
        this.showError('Error al cargar las listas');
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data: Cliente[]) => {
        this.clientes = data;
      },
      error: (err: Error) => {
        console.error('Error al cargar clientes:', err);
      }
    });
  }

  // <CHANGE> Método para cargar recetas
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

  // <CHANGE> Método para cargar rutinas
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

  filterListas(): void {
    if (!this.searchTerm.trim()) {
      this.filteredListas = this.listas;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredListas = this.listas.filter(l =>
      l.nombre.toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentListaId = null;
    this.listaForm.reset();
  }

  closeForm(): void {
    this.showForm = false;
    this.listaForm.reset();
  }

  editarLista(lista: Lista): void {
    this.showForm = true;
    this.editMode = true;
    this.currentListaId = lista.id || null;
    this.listaForm.patchValue({
      nombre: lista.nombre,
      clienteId: lista.clienteId,
      // <CHANGE> Cargar recetaId y rutinaId al editar
      recetaId: lista.receta?.id || null,
      rutinaId: lista.rutina?.id || null
    });
  }

  guardarLista(): void {
    if (this.listaForm.invalid) {
      this.listaForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.listaForm.value;
    
    // <CHANGE> Construir el objeto lista con receta y rutina como objetos
    const listaData: any = {
      nombre: formValue.nombre,
      clienteId: this.isAdmin ? formValue.clienteId : this.currentUserId,
      // Enviar receta y rutina como objetos con solo el id
      receta: formValue.recetaId ? { id: formValue.recetaId } : null,
      rutina: formValue.rutinaId ? { id: formValue.rutinaId } : null
    };

    if (this.editMode && this.currentListaId) {
      listaData.id = this.currentListaId;
      this.listaService.update(this.currentListaId, listaData).subscribe({
        next: () => {
          this.showSuccess('Lista actualizada correctamente');
          this.cargarListas();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al actualizar:', err);
          this.showError('Error al actualizar la lista');
          this.loading = false;
        }
      });
    } else {
      this.listaService.create(listaData).subscribe({
        next: () => {
          this.showSuccess('Lista creada correctamente');
          this.cargarListas();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al crear:', err);
          this.showError('Error al crear la lista');
          this.loading = false;
        }
      });
    }
  }

  confirmarEliminar(lista: Lista): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: {
        title: 'Eliminar Lista',
        message: `¿Estás seguro de eliminar la lista "${lista.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && lista.id) {
        this.eliminarLista(lista.id);
      }
    });
  }

  eliminarLista(id: number): void {
    this.loading = true;
    this.listaService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Lista eliminada correctamente');
        this.cargarListas();
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al eliminar:', err);
        this.showError('Error al eliminar la lista');
        this.loading = false;
      }
    });
  }

  getClienteNombre(lista: Lista): string {
    if (!lista.clienteId) return 'Sin asignar';
    const cliente = this.clientes.find(c => c.id === lista.clienteId);
    return cliente?.nombre || 'Sin asignar';
  }

  // <CHANGE> Método para obtener nombre de receta
  getRecetaNombre(lista: Lista): string {
    if (!lista.receta) return 'Sin receta';
    return lista.receta.nombre || 'Sin receta';
  }

  // <CHANGE> Método para obtener nombre de rutina
  getRutinaNombre(lista: Lista): string {
    if (!lista.rutina) return 'Sin rutina';
    return lista.rutina.nombre || 'Sin rutina';
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