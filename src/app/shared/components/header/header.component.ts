import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user.iterface';
import { Observable } from 'rxjs';

@Component({
  selector: 'shared-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  user: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.user = this.authService.currentUser$;
  }

  logout(){
    this.authService.logout();
    
  }
}
