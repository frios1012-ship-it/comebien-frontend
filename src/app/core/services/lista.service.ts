// src/app/core/services/lista.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lista } from '../models/lista';

@Injectable({ providedIn: 'root' })
export class ListaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/listas`;

  getAll(): Observable<Lista[]> {
    return this.http.get<Lista[]>(this.apiUrl);
  }

  create(lista: Lista): Observable<Lista> {
    return this.http.post<Lista>(this.apiUrl, lista);
  }

  update(id: number, lista: Lista): Observable<Lista> {
    return this.http.put<Lista>(`${this.apiUrl}/${id}`, lista);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getListasByCliente(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }
}