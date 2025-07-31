import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ToastService } from './toast-service';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { User } from '../../types/user';
import { Message } from '../../types/message';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private readonly hubUrl = environment.hubUrl;
  private readonly toast = inject(ToastService);
  public hubConnection?: HubConnection;
  public onlineUsers = signal<string[]>([]);

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection?.start().catch((err) => {
      console.error('Error establishing connection:', err);
      this.toast.error('Error establishing connection to the server.');
    });

    this.hubConnection?.on('UserOnline', (userId) => {
      this.onlineUsers.update((users) => [...users, userId]);
    });

    this.hubConnection?.on('UserOffline', (userId) => {
      this.onlineUsers.update((users) => users.filter((id) => id !== userId));
    });

    this.hubConnection?.on('GetOnlineUsers', (userIds) => {
      this.onlineUsers.set(userIds);
    });

    this.hubConnection?.on('NewMessageReceived', (message: Message) => {
      this.toast.info(
        `New message from ${message.senderDisplayName} has sent you a new message`,
        10000,
        message.senderImageUrl,
        `/members/${message.senderId}/messages`
      );
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch((err) => {
        console.error('Error stopping connection:', err);
        this.toast.error('Error stopping the connection to the server.');
      });
      this.hubConnection = undefined;
    }
  }
}
