import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Nav } from "../layout/nav/nav";
import { AccountService } from '../core/services/account-service';
import { Home } from "../features/home/home";
import { User } from '../types/user';

@Component({
  selector: 'app-root',
  imports: [Nav, Home],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly accountService = inject(AccountService);
  http = inject(HttpClient);
  protected title = 'Dating App';
  protected members = signal<User[]>([]);

  async ngOnInit() {
    this.setCurrentUser(); // Set the current user from local storage
    this.members.set(await this.getMembers());
  }

  setCurrentUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.accountService.currentUser.set(user);
    }
  }

  async getMembers() {
    try {
      return lastValueFrom(this.http.get<User[]>('https://localhost:5001/api/members'));
    }
    catch(error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  }

}
