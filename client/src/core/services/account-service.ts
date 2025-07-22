import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesService } from './likes-service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly likesService = inject(LikesService);
  // This service is responsible for handling user account operations such as login, registration, and profile management.
  currentUser = signal<User|null>(null); // Signal to hold the current user data, initialized to null.
  private readonly baseUrl = environment.apiUrl;

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
    localStorage.removeItem('filters'); // Clear any stored filters.
    this.likesService.clearLikeIds(); // Clear the like Ids when logging out.
    this.currentUser.set(null);
  }

  setCurrentUser(user: User) {
    // This method is used to set the current user in the service.
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user)); // Store the user data in local storage.
    this.likesService.getLikeIds();
  }
}
