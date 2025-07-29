import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { MessageService } from '../../../core/services/message-service';
import { Message } from '../../../types/message';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe,TimeAgoPipe, FormsModule],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages implements OnInit {
  @ViewChild('messageEndRef') messageEndRef!: ElementRef;
  private readonly messageService = inject(MessageService);
  private readonly memberService = inject(MemberService);
  protected messages = signal<Message[]>([]);
  protected messageContent = '';

  constructor() {
    effect(() => {
      const currentMessages = this.messages();
      if (currentMessages.length > 0) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit() {
    this.loadMessages();
  }

  private loadMessages() {
    const memberId = this.memberService.member()?.id;

    if (memberId) {
      this.messageService.getMessageThread(memberId).subscribe({
        next: (messages) => this.messages.set(messages.map(msg => ({
          ...msg,
          currentUserSender: msg.senderId !== memberId,
        }))),
        error: (error) => console.error(error),
      });
    }
  }

  sendMessage() {
    const recipientId = this.memberService.member()?.id;
    if (!recipientId) return;
    this.messageService.sendMessage(recipientId, this.messageContent).subscribe({
      next: (message) => {
        this.messages.update(messages => {
          message.currentUserSender = true;
          return [...messages, message];
        });
        this.messageContent = '';
      },
      error: (error) => console.error(error),
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (!this.messageEndRef) return;
      if (this.messageEndRef.nativeElement) {
        this.messageEndRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
}
