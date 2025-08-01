import { Component, computed, inject, input } from '@angular/core';
import { Member } from '../../../types/member';
import { RouterLink } from '@angular/router';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { LikesService } from '../../../core/services/likes-service';
import { PresenceService } from '../../../core/services/presence-service';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink, AgePipe],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css'
})
export class MemberCard {
  private readonly likeService = inject(LikesService);
  private readonly presenceService = inject(PresenceService);
  member = input.required<Member>();
  protected hasLiked = computed(() => this.likeService.likeIds().includes(this.member().id));
  protected isOnline = computed(() => this.presenceService.onlineUsers().includes(this.member().id));

  toggleLike(event: Event) {
    // Prevents click from being propagated to the parent elements.
    event.stopPropagation();
    this.likeService.toggleLike(this.member().id);
  }

}
