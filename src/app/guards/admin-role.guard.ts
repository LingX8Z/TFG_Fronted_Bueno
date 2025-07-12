import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminRoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  // Método que determina si el usuario puede activar la ruta (solo si tiene rol 'administrador')
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser$.pipe(
      map((user) => {
        if (user && user.roles.toLowerCase() === 'administrador') {
          return true;
        } else {
          return this.router.parseUrl('/error'); // Redirige si no tiene el rol adecuado
        }
      })
    );
  }
}
