import { Component, OnInit, OnDestroy } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs'; // Adjust this path if your AuthService is elsewhere
import { AuthService } from '../../services/auth.service';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-ias',
  standalone: false,
  templateUrl: './ias.component.html',
  styleUrls: ['./ias.component.css']
})
export class IAsComponent implements OnInit, OnDestroy {

  areButtonsVisible = true; // Controls visibility of the model selection grid
  isUserLoggedIn = false;   // Tracks user login status

  private routerSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private authService: AuthService, // Inject AuthService
    private BackgroundService: BackgroundService
  ) {}

// Se ejecuta al inicializar el componente
ngOnInit(): void {
  // Se suscribe a los eventos del router para mostrar u ocultar los botones
  this.routerSubscription = this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: Event) => {
      const navEndEvent = event as NavigationEnd;
      const currentUrl = navEndEvent.urlAfterRedirects;
      // Los botones se muestran solo si la ruta es exactamente '/ias'
      this.areButtonsVisible = currentUrl === '/ias';
    });

  // Se suscribe al observable del usuario actual para saber si hay sesión iniciada
  this.authSubscription = this.authService.currentUser$.subscribe(user => {
    this.isUserLoggedIn = !!user; // true si hay usuario logueado, false si es null
  });
}

// Se ejecuta al destruir el componente
ngOnDestroy(): void {
  // Cancela la suscripción al router para evitar fugas de memoria
  if (this.routerSubscription) {
    this.routerSubscription.unsubscribe();
  }
  // Cancela la suscripción al observable del usuario
  if (this.authSubscription) {
    this.authSubscription.unsubscribe();
  }
}

// Navega al modelo de IA seleccionado si el usuario está logueado, si no, muestra un aviso
navigateToModel(modelPath: string): void {
  if (this.isUserLoggedIn) {
    this.router.navigate(['/ias', modelPath]); // Navega a la ruta del modelo
  } else {
    alert('Por favor, inicia sesión para acceder a los modelos de IA.');
  }
}

}
