// src/app/core/models/ejercicio-rutina.ts

export interface EjercicioRutina {
  id?: number;
  orden: number;
  series: number;
  repeticiones: number;
  duracionSeg: number;
  intensidad: string;
  tiempo: string;
  rutinaId: number;
  ejercicioId: number;
  ejercicioNombre?: string; // solo lectura
}