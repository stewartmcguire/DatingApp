import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Member } from '../../types/member';
import { LikesParams } from '../../types/likes';
import { PaginatedResult } from '../../types/pagination';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  likeIds = signal<string[]>([]);

  toggleLike(targetMemberId: string) {
    return this.http.post(`${this.baseUrl}likes/${targetMemberId}`, {}).subscribe({
      next: () => {
        if (this.likeIds().includes(targetMemberId)) {
          this.likeIds.update(ids => ids.filter(id => id !== targetMemberId));
        } else {
          this.likeIds.update(ids => [...ids, targetMemberId]);
        }
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      }
    });
  }

  getLikes(likesParams: LikesParams) {
    let params = new HttpParams();
    params = params.append('pageNumber', likesParams.pageNumber);
    params = params.append('pageSize', likesParams.pageSize);
    params = params.append('predicate', likesParams.predicate);

    return this.http.get<PaginatedResult<Member>>(`${this.baseUrl}likes`, { params });
  }

  getLikeIds() {
    return this.http.get<string[]>(`${this.baseUrl}likes/list`).subscribe({
      next: (ids) => {
        this.likeIds.set(ids);
      },
      error: (error) => {
        console.error('Error fetching like Ids:', error);
      }
    });
  }

  clearLikeIds() {
    this.likeIds.set([]);
  }

}
