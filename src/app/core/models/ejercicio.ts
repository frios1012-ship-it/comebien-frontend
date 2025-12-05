// src/app/core/models/ejercicio.ts
export interface Ejercicio {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  grupoMuscular: string;
  metricaBase: string;
  imagen: string;
  fechaCreacion?: string;
}

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
  ejercicioNombre?: string;
}