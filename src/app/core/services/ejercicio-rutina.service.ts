// src/app/core/services/ejercicio-rutina.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EjercicioRutina } from '../models/ejercicio-rutina';

@Injectable({ providedIn: 'root' })
export class EjercicioRutinaService {
  private apiUrl = `${environment.apiUrl}/ejercicios-rutina`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EjercicioRutina[]> {
    return this.http.get<EjercicioRutina[]>(this.apiUrl);
  }

  create(data: EjercicioRutina): Observable<EjercicioRutina> {
    return this.http.post<EjercicioRutina>(this.apiUrl, data);
  }

  update(id: number, data: EjercicioRutina): Observable<EjercicioRutina> {
    return this.http.put<EjercicioRutina>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}