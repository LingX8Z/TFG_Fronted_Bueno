import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { User } from '../interfaces/user.iterface';

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://tfgbackend-production-35c6.up.railway.app/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.fetchUser(); // 🔐 siempre usa el backend como fuente de verdad
    }
  }

  // Registra un nuevo usuario y guarda su token y datos
register(data: RegisterPayload): Observable<any> {
  return this.http.post(`${this.apiUrl}/register`, data).pipe(
    map((res: any) => {
      if (!res.token) {
        throw new Error(res.message || 'Error en el registro');
      }
      this.saveToken(res.token);
      this.saveUser(res.user);
      return res;
    })
  );
}

// Inicia sesión con email y contraseña, guarda token y luego obtiene los datos del usuario
login(email: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
    map((res: any) => {
      if (!res.token) {
        throw new Error(res.message || 'Credenciales inválidas');
      }
      this.saveToken(res.token);
      this.fetchUser();
      return res;
    }),
    catchError(err => {
      const errorMsg = err?.error?.message || err?.message || 'Error al iniciar sesión';
      return throwError(() => new Error(errorMsg));
    })
  );
}

// Solicita al backend los datos del usuario actual usando el token almacenado
fetchUser(): void {
  this.http.get<User>(`${this.apiUrl}/me`).subscribe({
    next: (user) => this.currentUserSubject.next(user),
    error: (err) => {
      console.error('Error al obtener datos del usuario:', err);
      this.logout();
    }
  });
}

// Guarda el objeto usuario en el observable
saveUser(user: User): void {
  this.currentUserSubject.next(user);
}

// Devuelve el usuario actual almacenado localmente
getUser(): User | null {
  return this.currentUserSubject.value;
}

// Guarda el token JWT en sessionStorage
saveToken(token: string): void {
  sessionStorage.setItem('token', token);
}

// Recupera el token JWT desde sessionStorage
getToken(): string | null {
  return sessionStorage.getItem('token');
}

// Elimina el token y los datos del usuario, y limpia el observable
logout(): void {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  this.currentUserSubject.next(null);
}

// Verifica con el backend si el token almacenado es válido
isTokenValid() {
  return this.http.get(`${this.apiUrl}/check`).pipe(
    catchError(() => of(false))
  );
}

// Actualiza los datos del usuario (nombre y/o contraseña)
updateUser(data: {
  fullName: string;
  currentPassword?: string;
  newPassword?: string;
}): Observable<any> {
  return this.http.patch(`${this.apiUrl}/update`, data).pipe(
    tap((res: any) => {
      if (res.user) {
        this.saveUser(res.user);
      }
    })
  );
}

// Cambia el rol del usuario a Premium
upgradeToPremium(): Observable<any> {
  return this.http.patch(`${this.apiUrl}/upgrade-to-premium`, {}).pipe(
    tap((res: any) => {
      if (res.user) {
        this.saveUser(res.user);
      }
    }),
    catchError(error => {
      console.error('Error al actualizar a Premium:', error);
      return of(null);
    })
  );
}

// Cancela la suscripción Premium, devolviendo al rol User
cancelSubscription(): Observable<any> {
  return this.http.patch(`${this.apiUrl}/cancel-subscription`, {}).pipe(
    tap((res: any) => {
      if (res.user) {
        this.saveUser(res.user);
      }
    }),
    catchError(error => {
      console.error('Error al actualizar a User:', error);
      return of(null);
    })
  );
}

// Retorna true si hay un token JWT almacenado
isLoggedIn(): boolean {
  return !!this.getToken();
}

// Obtiene todos los usuarios registrados (uso administrativo)
getAllUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/users`);
}

// Elimina un usuario por ID (uso administrativo)
deleteUser(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/users/${id}`);
}

// Actualiza nombre y rol de un usuario por ID (uso administrativo)
updateUserDetails(id: string, data: { fullName: string; roles: string }): Observable<any> {
  return this.http.patch(`${this.apiUrl}/users/${id}`, data);
}

}
