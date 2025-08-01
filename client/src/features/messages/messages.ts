import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from '../../core/services/message-service';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { Paginator } from "../../shared/paginator/paginator";
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ConfirmDialogService } from '../../core/services/confirm-dialog-service';

@Component({
  selector: 'app-messages',
  imports: [Paginator,RouterLink,DatePipe],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class Messages implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected container = 'Inbox';
  protected fetchedContainer = this.container;
  protected pageNumber = 1;
  protected pageSize = 10;
  protected paginatedMessages = signal<PaginatedResult<Message> | null>(null);

  tabs = [
    { label: 'Inbox', value: 'Inbox' },
    { label: 'Outbox', value: 'Outbox' }
  ];

  ngOnInit() {
    this.loadMessages();
  }

  private loadMessages() {
    this.messageService.getMessages(this.container, this.pageNumber, this.pageSize)
      .subscribe({
        next: (response) => {
          this.paginatedMessages.set(response)
          this.fetchedContainer = this.container; // Update fetched container after loading messages
        },
        error: (error) => console.error(error)
      });
  }

  async confirmDelete(event: Event, id: string) {
    event.stopPropagation(); // Prevent click event from bubbling up
    try {
      const confirmed = await this.confirmDialog.confirm('Are you sure you want to delete this message?');
      if (confirmed) {
        this.deleteMessage(id);
      }
    }
    catch (error) {
      console.error('Error opening confirm dialog:', error);
    }
  }


  deleteMessage(id:string) {
    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        // Simplistic update of paginatedMessages after deletion
        const current = this.paginatedMessages();
        if (current?.items) {
          this.paginatedMessages.update(prev => {
            if (!prev) return null; // Handle case where paginatedMessages is null
            const newItems = prev.items.filter(msg => msg.id !== id) || [];
            return {
              items: newItems,
              metadata: prev.metadata // Preserve metadata
            };
          });
        }
      }
    });
  }

  get isInbox() {
    return this.fetchedContainer === 'Inbox';
  }

  setContainer(container: string) {
    this.container = container;
    this.pageNumber = 1; // Reset to first page when changing container
    this.loadMessages();
  }

  onPageChange(event: { pageNumber: number, pageSize: number }) {
    this.pageNumber = event.pageNumber;
    this.pageSize = event.pageSize;
    this.loadMessages();
  }

}
