import { Component, inject, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterCreds } from '../../../types/user';
//import { JsonPipe } from '@angular/common';
import { TextInput } from "../../../shared/text-input/text-input";
import { Router } from '@angular/router';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TextInput],  // JsonPipe,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register { // implements OnInit {
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  cancelRegister = output<boolean>();
  protected creds = {} as RegisterCreds;
  protected credentialsForm: FormGroup;
  protected profileForm: FormGroup;
  protected currentStep = signal<number>(1);
  protected validationErrors = signal<string[]>([]);

  constructor() {
    this.credentialsForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
    this.profileForm = this.fb.group({
      gender: ['male', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required]
    });

    this.credentialsForm.controls['password'].valueChanges.subscribe(() => {
      this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
    });
  }


/*
  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      displayName: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]),
      confirmPassword: new FormControl('', [Validators.required, this.matchValues('password')])
    });
    this.registerForm.controls['password'].valueChanges.subscribe(() => {
      this.registerForm.controls['confirmPassword'].updateValueAndValidity();
    });
  }
*/

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      return control.value === parent?.get(matchTo)?.value ? null : { passwordMismatch: true };
    };
  }

  nextStep() {
    if (this.credentialsForm.valid) {
      this.currentStep.update(value => value + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(value => value - 1);
    }
  }

  getMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  register() {
    if (this.profileForm.valid && this.credentialsForm.valid) {
      const formData = {
        ...this.credentialsForm.value,
        ...this.profileForm.value
      };

      this.accountService.register(formData).subscribe({
        next: () => {
          this.router.navigateByUrl('/members');
        },
        error: error => {
          console.error(error);
          this.validationErrors.set(error);
        }
      });
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
