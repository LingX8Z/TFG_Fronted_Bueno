export interface User {
    _id?: string; // opcional porque Mongo lo genera automáticamente
    email: string;
    password?: string; // opcional si no lo usás en el frontend
    fullName: string;
    isActive: boolean;
    roles: string[];
  }
  