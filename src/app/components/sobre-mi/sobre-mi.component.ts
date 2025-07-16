import { Component, OnInit } from '@angular/core';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-sobre-mi',
  standalone: false,
  templateUrl: './sobre-mi.component.html',
  styleUrl: './sobre-mi.component.css'
})
export class SobreMiComponent implements OnInit{

  constructor(private backgroundService: BackgroundService){}
  ngOnInit(): void {
    // Cambia el color de fondo al definido por el CSS personalizado
    this.backgroundService.setBackgroundColor('var(--color-background)');
  }
}
