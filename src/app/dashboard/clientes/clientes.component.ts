// src/app/dashboard/clientes/clientes.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Cliente } from '../../core/models/cliente';

@Component({
  selector: 'app-clientes',
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
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  clienteForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentClienteId: number | null = null;
  searchTerm = '';
  isAdmin = false;

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: ['', Validators.required],
      pesoObjetivo: [null, [Validators.required, Validators.min(1)]],
      talla: [null, [Validators.required, Validators.min(0.5), Validators.max(2.5)]]
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (data: Cliente[]) => {
        this.clientes = data;
        this.filteredClientes = data;
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al cargar clientes:', err);
        this.loading = false;
        this.showError('Error al cargar los clientes');
      }
    });
  }

  filterClientes(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClientes = this.clientes;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredClientes = this.clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(term)
    );
  }

  openForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentClienteId = null;
    this.clienteForm.reset();
  }

  closeForm(): void {
    this.showForm = false;
    this.clienteForm.reset();
  }

  editarCliente(cliente: Cliente): void {
    this.showForm = true;
    this.editMode = true;
    this.currentClienteId = cliente.id || null;
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      fechaNacimiento: cliente.fechaNacimiento,
      pesoObjetivo: cliente.pesoObjetivo,
      talla: cliente.talla
    });
  }

  // <CHANGE> Agregado markAllAsTouched para mostrar errores de validación
  guardarCliente(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const userId = this.authService.getUserId();
    
    const clienteData: Cliente = {
      ...this.clienteForm.value,
      userId: userId
    };

    if (this.editMode && this.currentClienteId) {
      // <CHANGE> Agregar el id al objeto clienteData para el update
      clienteData.id = this.currentClienteId;
      
      this.clienteService.update(this.currentClienteId, clienteData).subscribe({
        next: () => {
          this.showSuccess('Cliente actualizado correctamente');
          this.cargarClientes();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al actualizar:', err);
          this.showError('Error al actualizar el cliente');
          this.loading = false;
        }
      });
    } else {
      this.clienteService.create(clienteData).subscribe({
        next: () => {
          this.showSuccess('Cliente creado correctamente');
          this.cargarClientes();
          this.closeForm();
          this.loading = false;
        },
        error: (err: Error) => {
          console.error('Error al crear:', err);
          this.showError('Error al crear el cliente');
          this.loading = false;
        }
      });
    }
  }

  confirmarEliminar(cliente: Cliente): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      data: {
        title: 'Eliminar Cliente',
        message: `¿Estás seguro de eliminar al cliente "${cliente.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result && cliente.id) {
        this.eliminarCliente(cliente.id);
      }
    });
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  eliminarCliente(id: number): void {
    this.loading = true;
    this.clienteService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Cliente eliminado correctamente');
        this.cargarClientes();
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error al eliminar:', err);
        this.showError('Error al eliminar el cliente');
        this.loading = false;
      }
    });
  }

  formatDate(fecha: string | undefined): string {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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