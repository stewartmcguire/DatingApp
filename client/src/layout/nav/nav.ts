import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  protected readonly accountService = inject(AccountService); // Assuming you have an AccountService for handling authentication
  private readonly router = inject(Router);
  protected creds: any = {};
  private readonly toast = inject(ToastService); // Injecting a toast service for notifications

  login() {
    this.accountService.login(this.creds).subscribe({
      next: (response) => {
        this.router.navigateByUrl('/members'); // Navigate to members page after successful login
        this.toast.success('Logged in successfully!'); // Show success toast on login
        this.creds = {}; // Clear credentials after login
      },
      error: ({error}) => {
        this.toast.error(error); // Show error toast on login failure
      },
      complete: () => {
      }
    });
    // Here you would typically call a service to handle the login
    // For example: this.authService.login(this.creds).subscribe(response => { ... });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/'); // Navigate to home page after logout
  }
}
