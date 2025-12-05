// src/app/core/services/reporte.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes`;

  getTopRecetas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-recetas`);
  }

  getPromedioCaloriasPorCliente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promedio-calorias`);
  }

  getTotalRecetasPorCliente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/total-recetas-cliente`);
  }

  buscarRecetasPorNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar-receta/${nombre}`);
  }

  getRutinasPorNivel(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rutinas-nivel`);
  }

  getPromedioDuracionPorObjetivo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promedio-duracion`);
  }

  buscarRutinasPorObjetivo(objetivo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar-rutina/${objetivo}`);
  }

  getRutinasCortas(minutos: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rutinas-cortas/${minutos}`);
  }

  buscarClientesPorNombre(nombre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar-clientes/${nombre}`);
  }

  getClientesConMasListas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes-mas-listas`);
  }

  getTopListasFavoritas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-listas-favoritas`);
  }

  getPromedioCalificacionPorCliente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promedio-calif`);
  }
}