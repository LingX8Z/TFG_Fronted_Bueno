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
  ) { }

  // Método del ciclo de vida que se ejecuta al iniciar el componente
  ngOnInit(): void {
    // Cambia el color de fondo al definido por el CSS personalizado
    this.backgroundService.setBackgroundColor('var(--color-background)');

    // Verifica si el token JWT es válido
    this.authService.isTokenValid().subscribe((isValid: any) => {
      if (isValid) {
        this.logeado = true; // Usuario autenticado
      } else {
        this.logeado = false; // Usuario no autenticado
        this.authService.logout(); // Cierra sesión si el token no es válido
      }
    });

    // Obtiene los datos del usuario desde el servicio de autenticación
    this.user = this.authService.getUser();
  }

  // Método del ciclo de vida que se ejecuta al destruir el componente
  ngOnDestroy(): void {
    // Restaura el color de fondo original
    this.backgroundService.resetBackgroundColor();
  }

  // Navega al componente de chat correspondiente al nombre indicado
  goTo(chat: string): void {
    this.router.navigate([`/chat/${chat}`]);
  }

}
