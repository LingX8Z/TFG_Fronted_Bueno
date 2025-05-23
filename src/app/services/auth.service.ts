import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
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
  private apiUrl = 'http://localhost:3000/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.fetchUser(); // 🔐 siempre usa el backend como fuente de verdad
    }
  }

  register(data: RegisterPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        this.saveToken(res.token);
        this.saveUser(res.user);
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        this.saveToken(res.token);
        this.fetchUser(); // 🔁 ahora lo cargas con el token
      })
    );
  }

  fetchUser(): void {
    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: (user) =>
        this.currentUserSubject.next(user),
      error: (err) => {
        console.error('Error al obtener datos del usuario:', err);
        this.logout();
      }
    });
  }

  saveUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  saveToken(token: string): void {
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  isTokenValid() {
    return this.http.get(`${this.apiUrl}/check`).pipe(
      catchError(() => of(false)) // si hay error, asumimos que es inválido
    );
  }

  // auth.service.ts (extensión de tu servicio existente)
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

  upgradeToPremium(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/upgrade-to-premium`, {}).pipe(
      tap((res: any) => {
        if (res.user) {
          this.saveUser(res.user); // actualiza el observable y sessionStorage
        }
      }),
      catchError(error => {
        console.error('Error al actualizar a Premium:', error);
        return of(null);
      })
    );
  }


  cancelSubscription(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cancel-subscription`, {}).pipe(
      tap((res: any) => {
        if (res.user) {
          this.saveUser(res.user); // actualiza el observable y sessionStorage
        }
      }),
      catchError(error => {
        console.error('Error al actualizar a User:', error);
        return of(null);
      })
    );
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  updateUserDetails(id: string, data: { fullName: string; roles: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}`, data);
  }

}
