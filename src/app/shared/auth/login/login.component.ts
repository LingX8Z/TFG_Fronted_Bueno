import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackgroundService } from '../../../services/background.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  loginError: boolean = false;
  registerError: boolean = false;
  passwordMismatch: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private backgroundService: BackgroundService
  ) {}

  ngOnInit(): void {
    this.backgroundService.setBackgroundColor('var(--color-background)');

    // Inicializar formularios reactivos
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    this.backgroundService.resetBackgroundColor();
  }

  // 🔐 LOGIN
  onLoginSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.loginError = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.loginError = true;
      }
    });
  }

  // 🆕 REGISTER
  onRegisterSubmit(): void {
    if (this.registerForm.invalid) return;

    const { fullName, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.passwordMismatch = false;

    this.authService.register({ fullName, email, password }).subscribe({
      next: () => {
        this.registerError = false;
        // Opcional: redirigir o cambiar vista a login
        this.router.navigate(['/']);
      },
      error: () => {
        this.registerError = true;
      }
    });
  }
}
