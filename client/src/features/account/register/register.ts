import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegisterCreds, User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private accountService = inject(AccountService);
// not required:  membersFromHome = input.required<User[]>();
  cancelRegister = output<boolean>();
  protected creds = {} as RegisterCreds;

  register() {
    this.accountService.register(this.creds).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.cancel();
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.cancel();
      }
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
