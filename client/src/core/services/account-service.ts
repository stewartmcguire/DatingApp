import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesService } from './likes-service';
import { PresenceService } from './presence-service';
import { HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly likesService = inject(LikesService);
  private readonly presenceService = inject(PresenceService);
  // This service is responsible for handling user account operations such as login, registration, and profile management.
  currentUser = signal<User | null>(null); // Signal to hold the current user data, initialized to null.
  private readonly baseUrl = environment.apiUrl;

  register(creds: RegisterCreds) {
    return this.http
      .post<User>(this.baseUrl + 'account/register', creds, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this.setCurrentUser(user); // Update the current user signal with the new user data.
          this.startTokenRefreshInterval();
        })
      );
  }

  login(creds: LoginCreds) {
    // Sends a POST request to the server to log in the user with the provided credentials.
    return this.http
      .post<User>(this.baseUrl + 'account/login', creds, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this.setCurrentUser(user); // Update the current user signal with the new user data.
          this.startTokenRefreshInterval();
        })
      );
  }

  logout() {
    //    localStorage.removeItem('user'); // Remove user data from local storage on logout.
    localStorage.removeItem('filters'); // Clear any stored filters.
    this.likesService.clearLikeIds(); // Clear the like Ids when logging out.
    this.currentUser.set(null);
    this.presenceService.stopHubConnection();
  }

  refreshToken() {
    return this.http
      .post<User>(this.baseUrl + 'account/refresh-token', {}, {
        withCredentials: true,
      });
  }

  startTokenRefreshInterval() {
    setInterval(() => {
      this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, {
        withCredentials: true,
      }).subscribe({
        next: (user) => {
          this.setCurrentUser(user);
        },
        error: () => {
          this.logout(); // If the refresh token fails, log out the user.
        }
      });
    }, 5 * 60 * 1000); // Refresh token every 5 minutes
  }

  setCurrentUser(user: User) {
    user.roles = this.getRolesFromToken(user); // Extract roles from the user token.
    // This method is used to set the current user in the service.
    this.currentUser.set(user);
    //    localStorage.setItem('user', JSON.stringify(user)); // Store the user data in local storage.
    this.likesService.getLikeIds();
    if (this.presenceService.hubConnection?.state !== HubConnectionState.Connected) {
      this.presenceService.createHubConnection(user); // Create a SignalR hub connection if not already connected.
    }
  }

  private getRolesFromToken(user: User): string[] {
    // Extracts roles from the user token.
    if (!user.token) return [];
    // Extract the 2nd part of the JWT token which contains the payload, then decode it.
    const payload = user.token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return Array.isArray(decoded.role) ? decoded.role : [decoded.role];
  }
}
