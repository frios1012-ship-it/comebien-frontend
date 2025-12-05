// src/app/core/models/calificacion.ts
export interface Calificacion {
  id?: number;
  puntaje: number;
  comentario: string;
  clienteId: number;
  recetaId: number;
  listaId?: number;
}