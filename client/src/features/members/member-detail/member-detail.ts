import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Member } from '../../../types/member';
import { AgePipe } from '../../../core/pipes/age-pipe';

@Component({
  selector: 'app-member-detail',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AgePipe],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css'
})
export class MemberDetail implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected member = signal<Member|undefined>(undefined);
  protected title = signal<string|undefined>('Profile');

  ngOnInit(): void {
    this.route.data.subscribe({
      next: data => {
        this.member.set(data['member']);
      }
    });
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
