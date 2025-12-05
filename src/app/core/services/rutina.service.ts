// src/app/core/services/rutina.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rutina } from '../models/rutina';

@Injectable({ providedIn: 'root' })
export class RutinaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rutinas`;

  getAll(): Observable<Rutina[]> {
    return this.http.get<Rutina[]>(this.apiUrl);
  }

  create(rutina: Rutina): Observable<Rutina> {
    return this.http.post<Rutina>(this.apiUrl, rutina);
  }

  update(id: number, rutina: Rutina): Observable<Rutina> {
    return this.http.put<Rutina>(`${this.apiUrl}/${id}`, rutina);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}