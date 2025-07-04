import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  protected readonly accountService = inject(AccountService); // Assuming you have an AccountService for handling authentication
  protected creds: any = {};

  login() {
    this.accountService.login(this.creds).subscribe({
      next: (response) => {
        console.log('Login', response);
        this.creds = {}; // Clear credentials after login
      },
      error: error => alert(error.message),
      complete: () => {
      }
    });
    // Here you would typically call a service to handle the login
    // For example: this.authService.login(this.creds).subscribe(response => { ... });
  }

  logout() {
    this.accountService.logout();
  }
}
