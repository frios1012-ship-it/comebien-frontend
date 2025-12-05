// src/app/core/models/lista.ts
import { Receta } from './receta';
import { Rutina } from './rutina';

export interface Lista {
  id?: number;
  nombre: string;
  fechaCreacion?: string;
  clienteId: number;
  receta?: Receta;
  rutina?: Rutina;
}