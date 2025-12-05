// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./dashboard/home/home.component').then(m => m.HomeComponent) },
      { path: 'clientes', loadComponent: () => import('./dashboard/clientes/clientes.component').then(m => m.ClientesComponent) },
      { path: 'recetas', loadComponent: () => import('./dashboard/recetas/recetas.component').then(m => m.RecetasComponent) },
      { path: 'ingredientes', loadComponent: () => import('./dashboard/ingredientes/ingredientes.component').then(m => m.IngredientesComponent) },
      { path: 'ejercicios', loadComponent: () => import('./dashboard/ejercicios/ejercicios.component').then(m => m.EjerciciosComponent) },
      { path: 'ejercicios-rutina', loadComponent: () => import('./dashboard/ejercicios-rutina/ejercicios-rutina.component').then(m => m.EjerciciosRutinaComponent) },
      { path: 'rutinas', loadComponent: () => import('./dashboard/rutinas/rutinas.component').then(m => m.RutinasComponent) },
      { path: 'listas', loadComponent: () => import('./dashboard/listas/listas.component').then(m => m.ListasComponent) },
      { path: 'favoritos', loadComponent: () => import('./dashboard/favoritos/favoritos.component').then(m => m.FavoritosComponent) },
      { path: 'calificaciones', loadComponent: () => import('./dashboard/calificaciones/calificaciones.component').then(m => m.CalificacionesComponent) },
      { path: 'reportes', loadComponent: () => import('./dashboard/reportes/reportes.component').then(m => m.ReportesComponent) }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];