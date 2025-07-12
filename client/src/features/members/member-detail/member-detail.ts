import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Member } from '../../../types/member';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-member-detail',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AgePipe],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css'
})
export class MemberDetail implements OnInit {
  protected readonly memberService = inject(MemberService);
  private readonly accountService = inject(AccountService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected title = signal<string|undefined>('Profile');
  protected isCurrentUser = computed(() => {
    return this.accountService.currentUser()?.id === this.memberService.member()?.id;
  });

  ngOnInit(): void {
    this.title.set(this.route.firstChild?.snapshot.title);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Filter for ActivatedRoute events
    ).subscribe(() => {
        this.title.set(this.route.firstChild?.snapshot.title);
    });
  }

  goBack(): void {
    this.router.navigate(['members']);
  }
}
