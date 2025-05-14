import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackgroundService } from '../../../services/background.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  
  email: string = '';
  password: string = '';
  loginError: boolean = false;
  
  constructor(private backgroundService: BackgroundService , 
    private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    this.backgroundService.setBackgroundColor('var(--color-background)');  // Fondo gris claro
  }

  ngOnDestroy(): void {
    this.backgroundService.resetBackgroundColor();
  }


  onSubmit(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.loginError = false;

        // Redirigir al home u otra ruta protegida
        this.router.navigate(['/']);
      },
      error: () => {
        this.loginError = true;
      }
    });
  }

  
}
