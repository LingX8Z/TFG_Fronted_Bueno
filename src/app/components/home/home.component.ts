import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackgroundService } from '../../services/background.service';
// HttpClient no se usa directamente en el código proporcionado, podría eliminarse si no es necesario para otras partes.
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user.iterface';

@Component({
  selector: 'app-home',
  standalone: false, // Nota: standalone: false indica que es un componente basado en NgModule
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

  user: User | null = null;
  logeado: boolean = false; // Correctamente inicializado a false

  constructor(
    private backgroundService: BackgroundService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.backgroundService.setBackgroundColor('var(--color-background)');
    this.authService.isTokenValid().subscribe((isValid: any) => { // Asumimos que isValid es un booleano o tiene una estructura predecible
      // La lógica original es:
      // this.logeado = true; // Se pone a true temporalmente
      // if (!isValid) {
      //   this.logeado = false; // Se corrige a false si no es válido
      //   this.authService.logout();
      // }
      // Una forma más directa sería:
      if (isValid) { // Asumiendo que isValid es un booleano true para válido
        this.logeado = true;
      } else {
        this.logeado = false;
        this.authService.logout(); // Importante: esto cierra la sesión si el token no es válido
      }
    });
    this.user = this.authService.getUser();
  }

  ngOnDestroy(): void {
    this.backgroundService.resetBackgroundColor();
  }

  // El método goTo no es invocado por los routerLink directamente,
  // pero se mantiene por si se usa en otra parte.
  goTo(chat: string): void {
    this.router.navigate([`/chat/${chat}`]);
  }
}
