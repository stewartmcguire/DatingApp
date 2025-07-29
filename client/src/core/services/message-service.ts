import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Message } from '../../types/message';
import { PaginatedResult } from '../../types/pagination';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  getMessages(container: string, pageNumber: number, pageSize: number) {
    let params = new HttpParams();
    params = params.append('container', container);
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);

    return this.http.get<PaginatedResult<Message>>(`${this.baseUrl}messages`, { params });
  }

  getMessageThread(memberId: string) {
    return this.http.get<Message[]>(`${this.baseUrl}messages/thread/${memberId}`);
  }

  sendMessage(recipientId: string, content: string) {
    return this.http.post<Message>(`${this.baseUrl}messages`, { recipientId, content });
  }

  deleteMessage(id: string) {
    return this.http.delete(`${this.baseUrl}messages/${id}`);
  }
}
