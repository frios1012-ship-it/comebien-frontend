// src/app/core/models/rutina.ts
import { EjercicioRutina } from './ejercicio';

export interface Rutina {
  id?: number;
  nombre: string;
  objetivo: string;
  nivel: string;
  duracionTotal: number;
  imagen: string;
  fechaCreacion?: string;
  listaId?: number;
  ejercicios?: EjercicioRutina[];
}