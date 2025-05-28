import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pago-premium',
  standalone: false,
  templateUrl: './pago-premium.component.html',
  styleUrl: './pago-premium.component.css'
})
export class PagoPremiumComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cardNumberInput') cardNumberInput!: ElementRef<HTMLInputElement>;
  @ViewChild('expiryDateInput') expiryDateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('paymentForm') paymentForm!: NgForm;

  @ViewChild('paymentProcessingModal') paymentProcessingModal!: ElementRef<HTMLDivElement>;
  @ViewChild('modalSpinnerSection') modalSpinnerSection!: ElementRef<HTMLDivElement>;
  @ViewChild('modalSuccessSection') modalSuccessSection!: ElementRef<HTMLDivElement>;

  // Nuevo ViewChild para el modal de confirmación de cancelación (opcional, pero puede ser útil)
  @ViewChild('cancelConfirmModal') cancelConfirmModal!: ElementRef<HTMLDivElement>;

  public currentYear: number = new Date().getFullYear();
  public isModalVisible: boolean = false;
  public showSpinner: boolean = false;
  public showSuccessMessage: boolean = false;

  public isCancelConfirmModalVisible: boolean = false; // Para el nuevo modal

  public isAlreadyUpgraded: boolean = false;
  public currentUserRole: string | null = null;
  public currentUserName: string | null = null;
  private userSubscription!: Subscription;

  constructor(
    private renderer: Renderer2,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user && user.roles) {
        this.currentUserRole = user.roles;
        this.currentUserName = user.fullName; // Assuming fullName is part of User interface
        const roleLowerCase = user.roles.toLowerCase();
        if (roleLowerCase === 'premium' || roleLowerCase === 'administrador') {
          this.isAlreadyUpgraded = true;
        } else {
          this.isAlreadyUpgraded = false;
        }
      } else {
        this.isAlreadyUpgraded = false;
        this.currentUserRole = null;
        this.currentUserName = null;
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.isAlreadyUpgraded) {
      setTimeout(() => {
        this.setupCardNumberInput();
        this.setupExpiryDateInput();
      });
    }
  }

  private setupCardNumberInput(): void {
    if (!this.cardNumberInput || !this.cardNumberInput.nativeElement) return;
    const input = this.cardNumberInput.nativeElement;

    this.renderer.listen(input, 'input', () => {
      let value = input.value.replace(/\D/g, '').slice(0, 16);
      const formatted = value.match(/.{1,4}/g)?.join(' ') ?? '';
      input.value = formatted;
    });

    this.renderer.listen(input, 'keypress', (e: KeyboardEvent) => {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });

    this.renderer.listen(input, 'paste', (e: ClipboardEvent) => {
      e.preventDefault();
    });
  }

  private setupExpiryDateInput(): void {
    if (!this.expiryDateInput || !this.expiryDateInput.nativeElement) return;
    const input = this.expiryDateInput.nativeElement;

    this.renderer.listen(input, 'input', () => {
      let value = input.value.replace(/\D/g, '');
      if (value.length > 4) {
        value = value.slice(0, 4);
      }
      if (value.length >= 3) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      input.value = value;
    });

    this.renderer.listen(input, 'keypress', (e: KeyboardEvent) => {
      if (!/[0-9]/.test(e.key) && e.key !== '/') {
        e.preventDefault();
      }
    });
    this.renderer.listen(input, 'paste', (e: ClipboardEvent) => {
      e.preventDefault();
    });
  }

  processPayment(): void {
    if (this.paymentForm.invalid) {
      Object.values(this.paymentForm.controls).forEach(control => {
        control.markAsTouched();
      });
      console.log('Formulario inválido.');
      return;
    }

    this.isModalVisible = true;
    this.showSpinner = true;
    this.showSuccessMessage = false;

    setTimeout(() => {
      this.authService.upgradeToPremium().subscribe({
        next: (res) => {
          this.showSpinner = false;
          this.showSuccessMessage = true;

          if (this.modalSpinnerSection && this.modalSuccessSection) {
            this.renderer.setStyle(this.modalSpinnerSection.nativeElement, 'display', 'none');
            this.renderer.setStyle(this.modalSuccessSection.nativeElement, 'display', 'block');
          }
          this.paymentForm.resetForm();
          const user = this.authService.getUser();
          this.currentUserRole = user?.roles ?? null;
          this.isAlreadyUpgraded = this.currentUserRole?.toLowerCase() === 'premium' || this.currentUserRole?.toLowerCase() === 'administrador';
        },
        error: (err) => {
          console.error('Error al actualizar rol a Premium', err);
          this.closeModal(); // Cierra el modal de procesamiento en caso de error
        }
      });
    }, 3000);
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.showSpinner = false;
    this.showSuccessMessage = false;
    // Resetear estilos del modal de procesamiento si es necesario
    if (this.modalSpinnerSection && this.modalSuccessSection) {
        this.renderer.setStyle(this.modalSpinnerSection.nativeElement, 'display', 'block'); // O el display original
        this.renderer.setStyle(this.modalSuccessSection.nativeElement, 'display', 'none');
    }
  }

  // Métodos para el modal de confirmación de cancelación
  openCancelConfirmModal(): void {
    this.isCancelConfirmModalVisible = true;
  }

  closeCancelConfirmModal(): void {
    this.isCancelConfirmModalVisible = false;
  }

  confirmCancellation(): void {
    this.authService.cancelSubscription().subscribe({
      next: () => {
        // No es necesario resetear el paymentForm aquí si no se ha usado
        // this.paymentForm.resetForm(); // Comentado o eliminado si no aplica

        const user = this.authService.getUser();
        this.currentUserRole = user?.roles ?? null;
        this.authService.saveUser(user!)
        // isAlreadyUpgraded se actualizará automáticamente por el observable en ngOnInit
        // o puedes forzar la actualización si es necesario:
        const roleLowerCase = this.currentUserRole?.toLowerCase();
        this.isAlreadyUpgraded = roleLowerCase === 'premium' || roleLowerCase === 'administrador';

        this.closeCancelConfirmModal(); // Cierra el modal de confirmación
        // Opcional: Mostrar un mensaje de éxito/notificación de cancelación
        // console.log('Suscripción cancelada exitosamente.');
      },
      error: (err) => {
        console.error('Error al cancelar la suscripción', err);
        this.closeCancelConfirmModal(); // Cierra el modal de confirmación también en caso de error
        // Opcional: Mostrar un mensaje de error al usuario
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
