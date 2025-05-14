import { Injectable, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {


  constructor() {
  }

  // Método para cambiar la variable CSS de fondo
  setBackgroundColor(color: string): void {
    document.documentElement.style.setProperty('--background-color', color);
  }

  // Método para restablecer el fondo a su valor inicial
  resetBackgroundColor(): void {
    document.documentElement.style.setProperty('--background-color', 'var(--background-color)');
  }
}
