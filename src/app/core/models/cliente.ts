// src/app/core/models/cliente.ts
export interface Cliente {
  id?: number;
  nombre: string;
  fechaNacimiento: string;
  pesoObjetivo: number;
  talla: number;
  userId: number;
}