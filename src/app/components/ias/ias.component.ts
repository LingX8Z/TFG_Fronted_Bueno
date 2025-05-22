import { Component, OnInit, OnDestroy } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs'; // Adjust this path if your AuthService is elsewhere
import { AuthService } from '../../services/auth.service';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-ias',
  standalone: false,
  templateUrl: './ias.component.html',
  styleUrls: ['./ias.component.css']
})
export class IAsComponent implements OnInit, OnDestroy {

  areButtonsVisible = true; // Controls visibility of the model selection grid
  isUserLoggedIn = false;   // Tracks user login status

  private routerSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private authService: AuthService, // Inject AuthService
    private BackgroundService: BackgroundService
  ) {}

  ngOnInit(): void {
    // Subscribe to router events to control visibility of the model grid
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: Event) => { // Explicitly type event as Event or NavigationEnd
        const navEndEvent = event as NavigationEnd;
        const currentUrl = navEndEvent.urlAfterRedirects;
        // Show model grid only on the base '/ias' path, hide for sub-paths like '/ias/gemini'
        this.areButtonsVisible = currentUrl === '/ias';
      });

    // Subscribe to currentUser$ to get real-time login status
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isUserLoggedIn = !!user; // True if user object exists, false if null
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Updated to handle navigation only if logged in, or prompt for login
  navigateToModel(modelPath: string): void {
    if (this.isUserLoggedIn) {
      this.router.navigate(['/ias', modelPath]);
    } else {
      // You could use a more sophisticated modal/toast here
      alert('Por favor, inicia sesión para acceder a los modelos de IA.');
      // Optionally, redirect to login:
      // this.router.navigate(['/auth/login']); // Assuming '/auth/login' is your login route
    }
  }
}
