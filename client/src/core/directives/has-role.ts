import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../services/account-service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRole implements OnInit {
  @Input() appHasRole: string[] = [];
  private readonly accountService = inject(AccountService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef);

  ngOnInit(): void {
    if (this.accountService.currentUser()?.roles?.some(r => this.appHasRole.includes(r))) {
      // If the user has the required role, render the template
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
    else {
      this.viewContainerRef.clear();
    }
  }

}
