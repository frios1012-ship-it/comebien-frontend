// src/app/dashboard/reportes/reportes.component.ts
import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ReporteService } from '../../core/services/reporte.service';
import { take } from 'rxjs/operators';
// <CHANGE> Importar jsPDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent {

  private reporteService = inject(ReporteService);
  private snackBar = inject(MatSnackBar);

  // <CHANGE> Referencia al tab group para saber cuál está activo
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  activeTabIndex = 0;

  // Datos
  topRecetas: any[] = [];
  promedioCaloriasPorCliente: any[] = [];
  totalRecetasPorCliente: any[] = [];
  rutinasPorNivel: any[] = [];
  promedioDuracionPorObjetivo: any[] = [];
  clientesConMasListas: any[] = [];
  topListasFavoritas: any[] = [];
  promedioCalificacionPorCliente: any[] = [];

  // Busquedas
  busquedaReceta = '';
  resultadosBusquedaReceta: any[] = [];
  busquedaRecetaRealizada = false;

  busquedaRutina = '';
  resultadosBusquedaRutina: any[] = [];
  busquedaRutinaRealizada = false;

  minutosRutinasCortas = 30;
  rutinasCortas: any[] = [];
  busquedaRutinasCortasRealizada = false;

  busquedaCliente = '';
  resultadosBusquedaCliente: any[] = [];
  busquedaClienteRealizada = false;

  // Función para normalizar datos
  private normalizeData(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object') {
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.content && Array.isArray(data.content)) return data.content;
      if (data.items && Array.isArray(data.items)) return data.items;
      if (data.results && Array.isArray(data.results)) return data.results;
      return [data];
    }
    return [];
  }

  // Función para eliminar duplicados
  private removeDuplicates(arr: any[]): any[] {
    if (!Array.isArray(arr)) return [];
    return Array.from(
      new Set(arr.map(item => JSON.stringify(item)))
    ).map(item => JSON.parse(item));
  }

  // <CHANGE> Método para cambiar de tab
  onTabChange(index: number): void {
    this.activeTabIndex = index;
  }

  // <CHANGE> Método principal de exportar PDF
  exportarPDF(): void {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-ES');
    
    // Header del PDF
    doc.setFontSize(20);
    doc.setTextColor(38, 166, 154);
    doc.text('ComeBien - Centro de Reportes', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de exportación: ${fecha}`, 14, 28);

    let startY = 40;

    switch (this.activeTabIndex) {
      case 0: // Recetas
        startY = this.exportarRecetas(doc, startY);
        break;
      case 1: // Rutinas
        startY = this.exportarRutinas(doc, startY);
        break;
      case 2: // Clientes
        startY = this.exportarClientes(doc, startY);
        break;
      case 3: // Favoritos
        startY = this.exportarFavoritos(doc, startY);
        break;
    }

    // Guardar PDF
    const tabNames = ['Recetas', 'Rutinas', 'Clientes', 'Favoritos'];
    doc.save(`reporte_${tabNames[this.activeTabIndex].toLowerCase()}_${fecha.replace(/\//g, '-')}.pdf`);
    this.snackBar.open('PDF exportado correctamente', 'Cerrar', { duration: 3000 });
  }

  // <CHANGE> Exportar sección Recetas
  private exportarRecetas(doc: jsPDF, startY: number): number {
    // Top Recetas
    if (this.topRecetas.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Top Recetas', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['#', 'Nombre', 'Promedio', 'Total Calificaciones']],
        body: this.topRecetas.map((r, i) => [i + 1, r.nombreReceta, r.promedio, r.totalCalificaciones]),
        theme: 'striped',
        headStyles: { fillColor: [38, 166, 154] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Búsqueda de Recetas
    if (this.resultadosBusquedaReceta.length > 0) {
      doc.setFontSize(14);
      doc.text(`Búsqueda: "${this.busquedaReceta}"`, 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Nombre', 'Calorías']],
        body: this.resultadosBusquedaReceta.map(r => [r.nombre, `${r.caloriasTotales} cal`]),
        theme: 'striped',
        headStyles: { fillColor: [255, 152, 0] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Promedio Calorías por Cliente
    if (this.promedioCaloriasPorCliente.length > 0) {
      doc.setFontSize(14);
      doc.text('Promedio Calorías por Cliente', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Cliente', 'Promedio Calorías']],
        body: this.promedioCaloriasPorCliente.map(r => [r.cliente, `${r.promedioCalorias} cal`]),
        theme: 'striped',
        headStyles: { fillColor: [156, 39, 176] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Total Recetas por Cliente
    if (this.totalRecetasPorCliente.length > 0) {
      doc.setFontSize(14);
      doc.text('Total Recetas por Cliente', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Cliente', 'Total Recetas']],
        body: this.totalRecetasPorCliente.map(r => [r.cliente, r.totalRecetas]),
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    return startY;
  }

  // <CHANGE> Exportar sección Rutinas
  private exportarRutinas(doc: jsPDF, startY: number): number {
    // Rutinas por Nivel
    if (this.rutinasPorNivel.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Rutinas por Nivel', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Nivel', 'Total Rutinas']],
        body: this.rutinasPorNivel.map(r => [r.nivel, r.totalRutinas]),
        theme: 'striped',
        headStyles: { fillColor: [255, 152, 0] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Rutinas Cortas
    if (this.rutinasCortas.length > 0) {
      doc.setFontSize(14);
      doc.text(`Rutinas Cortas (< ${this.minutosRutinasCortas} min)`, 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Nombre', 'Objetivo']],
        body: this.rutinasCortas.map(r => [r.nombre, r.objetivo]),
        theme: 'striped',
        headStyles: { fillColor: [76, 175, 80] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Búsqueda por Objetivo
    if (this.resultadosBusquedaRutina.length > 0) {
      doc.setFontSize(14);
      doc.text(`Búsqueda por Objetivo: "${this.busquedaRutina}"`, 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Nombre', 'Objetivo']],
        body: this.resultadosBusquedaRutina.map(r => [r.nombre, r.objetivo]),
        theme: 'striped',
        headStyles: { fillColor: [156, 39, 176] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Promedio Duración por Objetivo
    if (this.promedioDuracionPorObjetivo.length > 0) {
      doc.setFontSize(14);
      doc.text('Duración Promedio por Objetivo', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Objetivo', 'Promedio (min)']],
        body: this.promedioDuracionPorObjetivo.map(r => [r.objetivo, r.promedioDuracion]),
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    return startY;
  }

  // <CHANGE> Exportar sección Clientes
  private exportarClientes(doc: jsPDF, startY: number): number {
    // Búsqueda de Clientes
    if (this.resultadosBusquedaCliente.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`Búsqueda: "${this.busquedaCliente}"`, 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Nombre', 'Email/Teléfono']],
        body: this.resultadosBusquedaCliente.map(r => [r.nombre, r.email || r.telefono || '']),
        theme: 'striped',
        headStyles: { fillColor: [156, 39, 176] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Clientes con Más Listas
    if (this.clientesConMasListas.length > 0) {
      doc.setFontSize(14);
      doc.text('Clientes con Más Listas', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['#', 'Cliente', 'Total Listas']],
        body: this.clientesConMasListas.map((r, i) => [i + 1, r.cliente, r.totalListas]),
        theme: 'striped',
        headStyles: { fillColor: [76, 175, 80] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    return startY;
  }

  // <CHANGE> Exportar sección Favoritos
  private exportarFavoritos(doc: jsPDF, startY: number): number {
    // Top Listas Favoritas
    if (this.topListasFavoritas.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Top Listas Favoritas', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['#', 'Nombre Lista', 'Total Favoritos']],
        body: this.topListasFavoritas.map((r, i) => [i + 1, r.nombreLista, r.totalFavoritos]),
        theme: 'striped',
        headStyles: { fillColor: [255, 152, 0] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Promedio Calificación por Cliente
    if (this.promedioCalificacionPorCliente.length > 0) {
      doc.setFontSize(14);
      doc.text('Promedio Calificación por Cliente', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Cliente', 'Promedio Puntaje']],
        body: this.promedioCalificacionPorCliente.map(r => [r.cliente, `${r.promedioPuntaje} estrellas`]),
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243] }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    }

    return startY;
  }

  // ... existing code (todos los métodos cargar y buscar) ...

  cargarTopRecetas(): void {
    this.topRecetas = [];
    this.reporteService.getTopRecetas().pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.topRecetas = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error cargando top recetas:", err);
        this.snackBar.open('Error al cargar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarPromedioCaloriasPorCliente(): void {
    this.promedioCaloriasPorCliente = [];
    this.reporteService.getPromedioCaloriasPorCliente().pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.promedioCaloriasPorCliente = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error:", err);
        this.snackBar.open('Error al cargar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarTotalRecetasPorCliente(): void {
    this.totalRecetasPorCliente = [];
    this.reporteService.getTotalRecetasPorCliente().pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.totalRecetasPorCliente = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error:", err);
        this.snackBar.open('Error al cargar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  buscarRecetasPorNombre(): void {
    if (!this.busquedaReceta.trim()) return;
    this.busquedaRecetaRealizada = true;
    this.reporteService.buscarRecetasPorNombre(this.busquedaReceta).pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.resultadosBusquedaReceta = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error en búsqueda:", err);
        this.snackBar.open('Error en la búsqueda', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarRutinasPorNivel(): void {
    this.rutinasPorNivel = [];
    this.reporteService.getRutinasPorNivel().pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.rutinasPorNivel = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error:", err);
        this.snackBar.open('Error al cargar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarPromedioDuracionPorObjetivo(): void {
    this.promedioDuracionPorObjetivo = [];
    this.reporteService.getPromedioDuracionPorObjetivo().pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.promedioDuracionPorObjetivo = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error:", err);
        this.snackBar.open('Error al cargar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  buscarRutinasPorObjetivo(): void {
    if (!this.busquedaRutina.trim()) return;
    this.busquedaRutinaRealizada = true;
    this.reporteService.buscarRutinasPorObjetivo(this.busquedaRutina).pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.resultadosBusquedaRutina = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error en búsqueda:", err);
        this.snackBar.open('Error en la búsqueda', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarRutinasCortas(): void {
    this.rutinasCortas = [];
    this.busquedaRutinasCortasRealizada = true;
    this.reporteService.getRutinasCortas(this.minutosRutinasCortas).pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.rutinasCortas = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error:", err);
        this.snackBar.open('Error al cargar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  buscarClientesPorNombre(): void {
    if (!this.busquedaCliente.trim()) return;
    this.busquedaClienteRealizada = true;
    this.reporteService.buscarClientesPorNombre(this.busquedaCliente).pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.resultadosBusquedaCliente = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error en búsqueda:", err);
        this.snackBar.open('Error en la búsqueda', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarClientesConMasListas(): void {
    this.clientesConMasListas = [];
    this.reporteService.getClientesConMasListas().pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.clientesConMasListas = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error:", err);
        this.snackBar.open('Error al cargar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarTopListasFavoritas(): void {
    this.topListasFavoritas = [];
    this.reporteService.getTopListasFavoritas().pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.topListasFavoritas = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error:", err);
        this.snackBar.open('Error al cargar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarPromedioCalificacionPorCliente(): void {
    this.promedioCalificacionPorCliente = [];
    this.reporteService.getPromedioCalificacionPorCliente().pipe(take(1)).subscribe({
      next: (data) => {
        const normalized = this.normalizeData(data);
        this.promedioCalificacionPorCliente = this.removeDuplicates(normalized);
      },
      error: (err) => {
        console.error("Error:", err);
        this.snackBar.open('Error al cargar reporte', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getLevelClass(index: number): string {
    const classes = ['beginner', 'intermediate', 'advanced'];
    return classes[index % classes.length];
  }

  trackById(index: number, item: any): number {
    return item.id || index;
  }
}