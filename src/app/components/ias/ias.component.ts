import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-ias',
  standalone: false,
  templateUrl: './ias.component.html',
  styleUrl: './ias.component.css'
})
export class IAsComponent {

  areButtonsVisible = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects;
        this.areButtonsVisible = currentUrl === '/ias'; // 👈 solo mostramos si es ruta exacta
      });
  }

  goTo(path: string) {
    this.router.navigate(['/ias', path]);
  }
}
