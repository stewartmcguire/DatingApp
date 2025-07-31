import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Message } from '../../types/message';
import { PaginatedResult } from '../../types/pagination';
import { AccountService } from './account-service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly baseUrl = environment.apiUrl;
  private readonly hubUrl = environment.hubUrl;
  private readonly http = inject(HttpClient);
  private readonly accountService = inject(AccountService);
  private hubConnection?: HubConnection;
  messageThread = signal<Message[]>([]);

  createHubConnection(otherUserId: string) {
    const currentUser = this.accountService.currentUser();
    if (!currentUser) return;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}messages?userId=${otherUserId}`, {
        accessTokenFactory: () => currentUser.token
      })
      .withAutomaticReconnect()
      .build();
    this.hubConnection.start().catch(err => console.log(err));

    this.hubConnection.on('ReceiveMessageThread', (messages: Message[]) => {
      this.messageThread.set(messages.map(msg => ({
          ...msg,
          currentUserSender: msg.senderId !== otherUserId,
        })))
    });

    this.hubConnection.on('NewMessage', (message: Message) => {
      message.currentUserSender = message.senderId === currentUser.id;
      this.messageThread.update(messages => [...messages, message]);
    });

  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(err => console.log(err));
      this.hubConnection = undefined;
    }
  }

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
    return this.hubConnection?.invoke('SendMessage', { recipientId, content });
  }

  deleteMessage(id: string) {
    return this.http.delete(`${this.baseUrl}messages/${id}`);
  }
}
