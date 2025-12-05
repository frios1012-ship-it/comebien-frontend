// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenResponse } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  login(credentials: { username: string; password: string }): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.jwtToken);
        localStorage.setItem('userId', response.id.toString());
        localStorage.setItem('authorities', response.authorities);
        // <CHANGE> Guardar username para mostrar en el home
        localStorage.setItem('userName', credentials.username);
        this.loggedIn.next(true);
      })
    );
  }

  register(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, {
      ...credentials,
      authorities: 'ROLE_USER'
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('authorities');
    localStorage.removeItem('userName'); // <CHANGE> Limpiar userName
    this.loggedIn.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  getAuthorities(): string | null {
    return localStorage.getItem('authorities');
  }

  isAdmin(): boolean {
    const authorities = this.getAuthorities();
    return authorities ? authorities.includes('ROLE_ADMIN') : false;
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }
}