import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../interfaces/user.iterface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestionar-micuenta',
  standalone: false,
  templateUrl: './gestionar-micuenta.component.html',
  styleUrls: ['./gestionar-micuenta.component.css'],
})
export class GestionarMicuentaComponent implements OnInit {
  userForm!: FormGroup;
  isLoading = false;
  showCurrent = false;
  showNew = false;
  showConfirm = false;
  user: Observable<User | null>;
  showModal = false; // Para mostrar/ocultar el modal
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';
  private pendingUpdateData: {
    fullName: string;
    currentPassword?: string;
    newPassword?: string;
  } | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.currentUser$;
  }

  // Se ejecuta al iniciar el componente: configura el formulario con los datos del usuario actual
  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.userForm = this.fb.group({
        email: [{ value: user?.email || '', disabled: true }],
        fullName: [user?.fullName || '', [Validators.required]],
        currentPassword: [''],
        newPassword: ['', [Validators.minLength(8)]],
        confirmPassword: [''],
      });
    });
  }

  // Alterna la visibilidad de los campos de contraseña según el tipo (actual, nueva o confirmación)
  toggleVisibility(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') this.showCurrent = !this.showCurrent;
    if (field === 'new') this.showNew = !this.showNew;
    if (field === 'confirm') this.showConfirm = !this.showConfirm;
  }

  // Maneja el envío del formulario: valida datos y muestra el modal de confirmación si todo está correcto
  onSubmit() {
    if (this.userForm.invalid) return;

    const { fullName, currentPassword, newPassword, confirmPassword } =
      this.userForm.getRawValue();

    if (newPassword && newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Guarda temporalmente los datos para confirmar antes de enviarlos al backend
    this.pendingUpdateData = {
      fullName,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    };
    this.showModal = true;
  }

  // Confirma la actualización del perfil: envía los datos al backend y gestiona la respuesta
  confirmUpdate() {
    if (!this.pendingUpdateData) return;

    this.isLoading = true;
    this.authService.updateUser(this.pendingUpdateData).subscribe({
      next: () => {
        this.isLoading = false;
        this.showModal = false;
        this.pendingUpdateData = null;
        this.showToast(' Perfil actualizado correctamente', 'success');
        this.onCancel(); // Recarga el formulario tras la actualización
      },
      error: (err) => {
        this.isLoading = false;
        this.showModal = false;
        this.showToast('Error al actualizar la contraseña es incorrecta', 'error');
        this.pendingUpdateData = null;
      },
    });
  }

  // Muestra una notificación (toast) con mensaje y tipo (éxito o error)
  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }

  // Cancela la acción del modal sin realizar cambios y limpia los datos pendientes
  cancelModal() {
    this.showModal = false;
    this.pendingUpdateData = null;
  }

  // Reinicia el formulario recargando los datos del usuario actual
  onCancel() {
    this.ngOnInit();
  }
}
