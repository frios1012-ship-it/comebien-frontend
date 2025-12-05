// src/app/core/services/favorito.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Favorito } from '../models/favorito';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/favoritos`;

  getAll(): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(this.apiUrl);
  }

  create(favorito: Favorito): Observable<Favorito> {
    return this.http.post<Favorito>(this.apiUrl, favorito);
  }

  update(id: number, favorito: Favorito): Observable<Favorito> {
    return this.http.put<Favorito>(`${this.apiUrl}/${id}`, favorito);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}