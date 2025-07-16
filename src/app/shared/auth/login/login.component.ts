import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackgroundService } from '../../../services/background.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  loginError: boolean = false;
  registerError: boolean = false;
  passwordMismatch: boolean = false;

  loginErrorMessage: string = '';
  registerErrorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private backgroundService: BackgroundService
  ) {}

  // Método del ciclo de vida: se ejecuta al inicializar el componente, configura los formularios y el fondo
  ngOnInit(): void {
    this.backgroundService.setBackgroundColor('var(--color-background)');

    // Inicializar formularios reactivos
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    });
  }

  // Método del ciclo de vida: se ejecuta al destruir el componente, restaura el fondo original
  ngOnDestroy(): void {
    this.backgroundService.resetBackgroundColor();
  }

  // Método que maneja el envío del formulario de login
onLoginSubmit(): void {
  if (this.loginForm.invalid) return;

  const { email, password } = this.loginForm.value;
  this.authService.login(email, password).subscribe({
    next: () => {
      this.loginError = false;
      this.loginErrorMessage = '';
      this.router.navigate(['/']);
    },
    error: (err) => {
      console.error('ERROR DE LOGIN', err);
      this.loginError = true;
      this.loginErrorMessage =
        err?.error?.message ||
        err?.message ||
        'Error al iniciar sesión. Inténtalo de nuevo.';

      // Quitar el error en 10 segundos
      setTimeout(() => {
        this.loginError = false;
        this.loginErrorMessage = '';
      }, 10000);
    },
  });
}



  //  REGISTER
onRegisterSubmit(): void {
  if (this.registerForm.invalid) return;

  const { fullName, email, password, confirmPassword } = this.registerForm.value;

  if (password !== confirmPassword) {
    this.passwordMismatch = true;
    this.registerError = true;
    this.registerErrorMessage = 'Las contraseñas no coinciden';
    // Quitar el error en 10 segundos
    setTimeout(() => {
      this.passwordMismatch = false;
      this.registerError = false;
      this.registerErrorMessage = '';
    }, 10000);
    return;
  }

  this.passwordMismatch = false;

  this.authService.register({ fullName, email, password }).subscribe({
    next: () => {
      this.registerError = false;
      this.registerErrorMessage = '';
      this.router.navigate(['/']);
    },
    error: (err) => {
      console.error('ERROR DE REGISTER', err);
      this.registerError = true;
      this.registerErrorMessage =
        err?.error?.message ||
        err?.message ||
        'Error al registrar. Inténtalo más tarde.';

      // Quitar el error en 10 segundos
      setTimeout(() => {
        this.registerError = false;
        this.registerErrorMessage = '';
      }, 10000);
    },
  });
}


}
