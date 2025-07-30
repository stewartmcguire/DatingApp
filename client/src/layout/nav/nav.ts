import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';
import { themes } from '../theme';
import { BusyService } from '../../core/services/busy-service';
import { HasRole } from '../../core/directives/has-role';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive, HasRole],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav implements OnInit {
  protected readonly accountService = inject(AccountService); // Assuming you have an AccountService for handling authentication
  protected busyService = inject(BusyService); // Injecting the BusyService to manage loading states
  private readonly router = inject(Router);
  protected creds: any = {};
  private readonly toast = inject(ToastService); // Injecting a toast service for notifications
  protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
  protected themes = themes;

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme()); // Apply the theme to the document
  }

  handleSelectTheme(theme: string) {
    this.selectedTheme.set(theme); // Update the selected theme
    localStorage.setItem('theme', theme); // Save the selected theme to local storage
    document.documentElement.setAttribute('data-theme', theme); // Apply the theme to the document
    const elem = document.activeElement as HTMLDivElement;
    if (elem) {
      elem.blur(); // Remove focus from the dropdown to prevent it from staying open
    }
  }

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
