// src/app/core/models/receta.ts
import { IngredienteReceta } from './ingrediente';

export interface Receta {
  id?: number;
  nombre: string;
  instrucciones: string;
  tiempoPreparacion: number;
  caloriasTotales: number;
  imagen: string;
  clienteId: number;
  ingredientes?: IngredienteReceta[];
}