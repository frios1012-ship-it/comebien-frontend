// src/app/dashboard/layout/layout.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuItems = [
    { icon: 'home', label: 'Inicio', route: '/dashboard/home' },
    { icon: 'people', label: 'Clientes', route: '/dashboard/clientes' },
    { icon: 'restaurant_menu', label: 'Recetas', route: '/dashboard/recetas' },
    { icon: 'kitchen', label: 'Ingredientes', route: '/dashboard/ingredientes' },
    { icon: 'fitness_center', label: 'Ejercicios', route: '/dashboard/ejercicios' },
    { icon: 'fitness_center', label: 'Ejercicios-Rutina', route: '/dashboard/ejercicios-rutina' },
    { icon: 'directions_run', label: 'Rutinas', route: '/dashboard/rutinas' },
    { icon: 'list', label: 'Listas', route: '/dashboard/listas' },
    { icon: 'favorite', label: 'Favoritos', route: '/dashboard/favoritos' },
    { icon: 'star', label: 'Calificaciones', route: '/dashboard/calificaciones' },
    { icon: 'bar_chart', label: 'Reportes', route: '/dashboard/reportes' }
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}