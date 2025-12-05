// src/app/core/services/receta.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Receta } from '../models/receta';

@Injectable({ providedIn: 'root' })
export class RecetaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/recetas`;

  getAll(): Observable<Receta[]> {
    return this.http.get<Receta[]>(this.apiUrl);
  }

  getById(id: number): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}/${id}`);
  }

  create(receta: Receta): Observable<Receta> {
    return this.http.post<Receta>(this.apiUrl, receta);
  }

  update(id: number, receta: Receta): Observable<Receta> {
    return this.http.put<Receta>(`${this.apiUrl}/${id}`, receta);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}