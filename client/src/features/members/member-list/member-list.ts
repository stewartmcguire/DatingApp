import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Member, MemberParams } from '../../../types/member';
import { MemberCard } from "../member-card/member-card";
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from '../../../shared/paginator/paginator';
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
  selector: 'app-member-list',
  imports: [MemberCard, Paginator, FilterModal],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css'
})
export class MemberList implements OnInit {
  @ViewChild('filterModal') modal!: FilterModal;
  private readonly memberService = inject(MemberService);
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);
  protected memberParams = new MemberParams();
  private updatedParams = new MemberParams();

  constructor() {
    const storedFilters = localStorage.getItem('filters');
    if (storedFilters) {
      this.memberParams = JSON.parse(storedFilters);
      this.updatedParams = { ...this.memberParams };
    }
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.memberParams).subscribe({
      next: (result) => {
        this.paginatedMembers.set(result);
      }
    });
  }

  onPageChange(event: { pageNumber: number, pageSize: number }) {
    this.memberParams.pageNumber = event.pageNumber;
    this.memberParams.pageSize = event.pageSize;
    this.loadMembers();
  }

  openModal() {
    this.modal.open();
  }

  modalClosed() {
    console.log("Modal closed");
  }

  onFilterChange(params: MemberParams) {
    this.memberParams = { ...params };
    this.updatedParams = { ...params };
    console.log("Filter changed", params);
    this.loadMembers();
  }

  resetFilters() {
    this.memberParams = new MemberParams();
    this.updatedParams = new MemberParams();
    this.loadMembers();
  }

  get displayMessage(): string {
    const defaultParams = new MemberParams();
    const filters: string[] = [];

    if (this.updatedParams.gender) {
      filters.push(`${this.updatedParams.gender}s`);
    }
    else {
      filters.push('All members');
    }
    if (this.updatedParams.minAge !== defaultParams.minAge
        || this.updatedParams.maxAge !== defaultParams.maxAge) {
      filters.push(`Ages ${this.updatedParams.minAge}-${this.updatedParams.maxAge}`);
    }
    filters.push(this.updatedParams.orderBy === 'lastActive'
      ? 'Recently active' : 'Newest members');
    return filters.length > 0 ? `Selected: ${filters.join(', ')}` : 'No filters selected';
  }

}
