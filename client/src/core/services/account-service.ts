import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  // This service is responsible for handling user account operations such as login, registration, and profile management.
  private readonly http = inject(HttpClient);
  currentUser = signal<User|null>(null); // Signal to hold the current user data, initialized to null.

  baseUrl = 'https://localhost:5001/api/';

  register(creds: RegisterCreds) {
    return this.http.post<User>(this.baseUrl + 'account/register', creds).pipe(
      tap((user) => {
        this.setCurrentUser(user); // Update the current user signal with the new user data.
      })
    );
  }

  login(creds: LoginCreds) {
    // Sends a POST request to the server to log in the user with the provided credentials.
    return this.http.post<User>(this.baseUrl + 'account/login', creds).pipe(
      tap((user) => {
        this.setCurrentUser(user); // Update the current user signal with the new user data.
      })
    );
  }

  logout() {
    localStorage.removeItem('user'); // Remove user data from local storage on logout.
    this.currentUser.set(null);
  }

  setCurrentUser(user: User) {
    // This method is used to set the current user in the service.
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user)); // Store the user data in local storage.
  }
}
