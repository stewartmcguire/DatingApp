import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { Observable, of } from 'rxjs';
import { LikesService } from './likes-service';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private readonly accountService = inject(AccountService);
  private readonly likesService = inject(LikesService);

  init(): Observable<null> {
    const userData = localStorage.getItem('user');
    if (!userData) return of(null);
    const user = JSON.parse(userData);
    this.accountService.currentUser.set(user);
    this.likesService.getLikeIds();

    return of(null);
  }


}
