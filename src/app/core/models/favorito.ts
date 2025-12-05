// src/app/core/models/favorito.ts
export interface Favorito {
  id?: number;
  fechaGuardado?: string;
  notas: string;
  clienteId: number;
  clienteNombre?: string;
  listaId: number;
  listaNombre?: string;
}