// src/app/dashboard/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { ClienteService } from '../../core/services/cliente.service';
import { RecetaService } from '../../core/services/receta.service';
import { RutinaService } from '../../core/services/rutina.service';
import { ReporteService } from '../../core/services/reporte.service';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,          // <-- NECESARIO para routerLink
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  isAdmin = false;
  loading = true;
  userName = '';
  today = new Date();

  // Stats
  totalClientes = 0;
  totalRecetas = 0;
  totalRutinas = 0;
  promedioCalificacionGlobal: number | null = null; // <-- dinámico

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private recetaService: RecetaService,
    private rutinaService: RutinaService,
    private reporteService: ReporteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.userName = this.isAdmin ? 'Administrador' : (this.authService.getUserName() || 'Usuario');    
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.loading = true;

    forkJoin({
      clientes: this.clienteService.getAll(),
      recetas: this.recetaService.getAll(),
      rutinas: this.rutinaService.getAll(),
      calificaciones: this.reporteService.getPromedioCalificacionPorCliente()
    }).subscribe({
      next: (data: any) => {
        this.totalClientes = data.clientes?.length || 0;
        this.totalRecetas = data.recetas?.length || 0;
        this.totalRutinas = data.rutinas?.length || 0;

        // Calcular promedio global de calificación
        const registros = Array.isArray(data.calificaciones) ? data.calificaciones : [];
        const valores = registros
          .map((r: any) => r.promedioPuntaje)
          .filter((v: any) => typeof v === 'number');
        if (valores.length > 0) {
          const suma = valores.reduce((acc: number, v: number) => acc + v, 0);
          this.promedioCalificacionGlobal = parseFloat((suma / valores.length).toFixed(1));
        } else {
          this.promedioCalificacionGlobal = null;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.loading = false;
        this.promedioCalificacionGlobal = null;
      }
    });
  }

  // Métodos de navegación (por si los quieres usar con (click))
  navegarAClientes(): void {
    this.router.navigate(['/dashboard/clientes'], { queryParams: { action: 'new' } });
  }

  navegarARecetas(): void {
    this.router.navigate(['/dashboard/recetas'], { queryParams: { action: 'new' } });
  }

  navegarARutinas(): void {
    this.router.navigate(['/dashboard/rutinas'], { queryParams: { action: 'new' } });
  }

  navegarAReportes(): void {
    this.router.navigate(['/dashboard/reportes']);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
