// src/app/core/models/ingrediente.ts
export interface Ingrediente {
  id?: number;
  nombre: string;
  caloriasPor100g: number;
  proteinasPor100g: number;
  carbohidratosPor100g: number;
  grasasPor100g: number;
}

export interface IngredienteReceta {
  id?: number;
  cantidad: number;
  unidad: string;
  ingredienteId: number;
  ingredienteNombre?: string;
}