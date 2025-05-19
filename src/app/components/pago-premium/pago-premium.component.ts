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

  public currentYear: number = new Date().getFullYear();
  public isModalVisible: boolean = false;
  public showSpinner: boolean = false;
  public showSuccessMessage: boolean = false;

  public isAlreadyUpgraded: boolean = false;
  public currentUserRole: string | null = null;
  public currentUserName: string | null = null;
  private userSubscription!: Subscription;

  constructor(
    private renderer: Renderer2,
    private authService: AuthService
  ) {}

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
        // No user or no roles, so not upgraded
        this.isAlreadyUpgraded = false;
        this.currentUserRole = null;
        this.currentUserName = null;
      }
    });
  }

  ngAfterViewInit(): void {
    // Only setup payment inputs if the user is not already upgraded
    if (!this.isAlreadyUpgraded) {
        // Defer setup slightly to ensure ViewChilds are available if ngIf initially hides them
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
      console.log('Form is invalid. Please fill all required fields.');
      return;
    }

    this.isModalVisible = true;
    this.showSpinner = true;
    this.showSuccessMessage = false;

    if (this.modalSpinnerSection && this.modalSuccessSection) {
        this.renderer.setStyle(this.modalSpinnerSection.nativeElement, 'display', 'block');
        this.renderer.setStyle(this.modalSuccessSection.nativeElement, 'display', 'none');
    }

    setTimeout(() => {
      this.showSpinner = false;
      this.showSuccessMessage = true;
      if (this.modalSpinnerSection && this.modalSuccessSection) {
        this.renderer.setStyle(this.modalSpinnerSection.nativeElement, 'display', 'none');
        this.renderer.setStyle(this.modalSuccessSection.nativeElement, 'display', 'block');
      }
      this.paymentForm.resetForm();
      // Potentially update user role via AuthService here and refresh isAlreadyUpgraded status
      // For now, we assume the backend handles role update and a page refresh/re-login would show new status
      // Or, you can call a method in authService to refresh user data.
      // Example: this.authService.refreshCurrentUser();
      // Then the subscription in ngOnInit would pick up the change.
      // For simplicity, we'll just show the success. A real app would update the user's state.
      this.isAlreadyUpgraded = true; // Simulate immediate upgrade for UI
      this.currentUserRole = 'Premium'; // Simulate role change

    }, 5000);
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.showSpinner = false;
    this.showSuccessMessage = false;
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
