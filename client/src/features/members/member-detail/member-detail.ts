import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Member } from '../../../types/member';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { AccountService } from '../../../core/services/account-service';
import { PresenceService } from '../../../core/services/presence-service';
import { LikesService } from '../../../core/services/likes-service';

@Component({
  selector: 'app-member-detail',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AgePipe],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css'
})
export class MemberDetail implements OnInit {
  protected readonly memberService = inject(MemberService);
  private readonly accountService = inject(AccountService);
  protected readonly presenceService = inject(PresenceService);
  protected readonly likesService = inject(LikesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected title = signal<string|undefined>('Profile');
  private readonly routeId = signal<string|null>(null);
  protected isCurrentUser = computed(() => {
    return this.accountService.currentUser()?.id === this.routeId();
  });
   protected hasLiked = computed(() => this.likesService.likeIds().includes(this.routeId()!));


  constructor() {
    this.route.paramMap.subscribe(params => {
      this.routeId.set(params.get('id'));
    });
  }

  ngOnInit(): void {
    this.title.set(this.route.firstChild?.snapshot.title);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd) // Filter for ActivatedRoute events
    ).subscribe(() => {
        this.title.set(this.route.firstChild?.snapshot.title);
    });
  }

}
