import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user.iterface';
import { Observable } from 'rxjs';

@Component({
  selector: 'shared-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  user: Observable<User | null>;
  menuAbierto = false;
  isMobile = false;

  constructor(private authService: AuthService) {
    this.user = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.checkIfMobile();
  }
  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    if (this.menuAbierto) {
      document.body.style.overflow = 'hidden'; // Evita scroll del body cuando el menú está abierto
    } else {
      document.body.style.overflow = '';
    }
  }

  cerrarMenuSiEsMovil(): void {
    if (this.isMobile && this.menuAbierto) {
      this.toggleMenu();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event): void {
    this.checkIfMobile();
    if (!this.isMobile && this.menuAbierto) {
      // Si se redimensiona a pantalla grande y el menú estaba abierto, ciérralo.
      this.toggleMenu();
    }
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768; // O el breakpoint que definas
  }

  logout(){
    this.authService.logout();

  }

}
