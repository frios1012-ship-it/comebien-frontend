// src/app/core/models/user.ts
export interface User {
  id?: number;
  username: string;
  password: string;
  authorities?: string;
}

export interface TokenResponse {
  jwtToken: string;
  id: number;
  authorities: string;
}