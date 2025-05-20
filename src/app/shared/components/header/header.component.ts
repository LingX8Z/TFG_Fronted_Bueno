import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service'; // Verifica esta ruta
import { User } from '../../../interfaces/user.iterface'; // Verifica esta ruta y el nombre del archivo (debería ser .interface.ts)
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'shared-header',
  standalone: false, // Si tu componente no es standalone
  templateUrl: './header.component.html',
  // Añade un nuevo archivo CSS para los estilos específicos del menú de usuario o inclúyelos en el existente
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: Observable<User | null>;
  menuAbierto = false;
  userMenuOpen = false; // Para el menú desplegable del usuario en escritorio
  isMobile = false;

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef, // Para detectar clics fuera del menú
    private router: Router
  ) {
    this.user = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.checkIfMobile();
    // Opcional: Suscribirse a cambios del usuario para cerrar el menú si se cierra sesión desde otro lugar
    this.user.subscribe(currentUser => {
      if (!currentUser) {
        this.userMenuOpen = false; // Cierra el menú de usuario si no hay usuario
      }
    });
  }

  toggleMenu(): void { // Para el menú principal móvil
    this.menuAbierto = !this.menuAbierto;
    if (this.menuAbierto) {
      document.body.style.overflow = 'hidden';
      this.userMenuOpen = false; // Cierra el menú de usuario si se abre el menú móvil principal
    } else {
      document.body.style.overflow = '';
    }
  }

  // Para el menú desplegable del usuario en escritorio
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    if (this.userMenuOpen) {
      this.userMenuOpen = false;
    }
  }

  cerrarMenuSiEsMovil(): void { // Cierra el menú principal móvil
    if (this.isMobile && this.menuAbierto) {
      this.menuAbierto = false;
      document.body.style.overflow = '';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event): void {
    const oldIsMobile = this.isMobile;
    this.checkIfMobile();

    if (!this.isMobile && this.menuAbierto) { // Si se redimensiona a escritorio y el menú móvil estaba abierto
      this.menuAbierto = false;
      document.body.style.overflow = '';
    }
    if (!oldIsMobile && this.isMobile && this.userMenuOpen) { // Si se redimensiona a móvil y el menú de usuario de escritorio estaba abierto
      this.userMenuOpen = false;
    }
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768; // Ajusta este breakpoint según tu CSS
  }

  performLogout(): void { // Logout desde el menú de escritorio
    this.authService.logout();
    this.router.navigate(['/home']);
    this.closeUserMenu();
    this.cerrarMenuSiEsMovil(); // Aunque improbable, cierra el menú móvil si estuviera abierto
  }

  performLogoutMobile(): void { // Logout desde el menú móvil
    this.authService.logout();
    this.router.navigate(['/home']);
    this.cerrarMenuSiEsMovil(); // Cierra el menú móvil principal
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Cierra el menú de usuario de escritorio si se hace clic fuera de él
    const userProfileAreaDesktop = this.elementRef.nativeElement.querySelector('.user-profile-area-desktop');
    if (this.userMenuOpen && userProfileAreaDesktop && !userProfileAreaDesktop.contains(event.target as Node)) {
      this.closeUserMenu();
    }

    const mainMobileNav = this.elementRef.nativeElement.querySelector('.header__nav');
    const menuToggle = this.elementRef.nativeElement.querySelector('.header__menu-toggle');
    if (this.menuAbierto && mainMobileNav && !mainMobileNav.contains(event.target as Node) &&
      menuToggle && !menuToggle.contains(event.target as Node)) {
      this.cerrarMenuSiEsMovil();
    }
  }
}
