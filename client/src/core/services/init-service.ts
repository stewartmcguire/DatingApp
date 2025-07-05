import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private accountService = inject(AccountService);

  init(): Observable<null> {
    const userData = localStorage.getItem('user');
    if (!userData) return of(null);
    const user = JSON.parse(userData);
    this.accountService.currentUser.set(user);

    return of(null);
  }


}
