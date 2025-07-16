export interface User {
    _id?: string;
    email: string;
    password?: string;
    fullName: string;
    isActive: boolean;
    roles: string;
  }
