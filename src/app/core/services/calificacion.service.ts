// src/app/core/services/calificacion.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Calificacion } from '../models/calificacion';

@Injectable({ providedIn: 'root' })
export class CalificacionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/calificaciones`;

  getAll(): Observable<Calificacion[]> {
    return this.http.get<Calificacion[]>(this.apiUrl);
  }

  create(calificacion: Calificacion): Observable<Calificacion> {
    return this.http.post<Calificacion>(this.apiUrl, calificacion);
  }

  update(id: number, calificacion: Calificacion): Observable<Calificacion> {
    return this.http.put<Calificacion>(`${this.apiUrl}/${id}`, calificacion);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}