//registration.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzIconModule,
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  form!: FormGroup;
  isSubmitted: boolean = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

inviteToken: string | null = null;
inviteEmail: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private service: AuthService,
    private message: NzMessageService, // ✅ changed from toastr
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
  this.form = this.formBuilder.group(
    {
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/),
        ],
      ],
      confirmPassword: [''],
    },
    { validators: this.passwordMatchValidator }
  );

  // ✅ Check for invite token in query
  this.inviteToken = this.route.snapshot.queryParamMap.get('inviteToken');
  if (this.inviteToken) {
    this.service.validateInviteToken(this.inviteToken).subscribe({
      next: (res: any) => {
        this.inviteEmail = res.email;
        this.form.get('email')?.setValue(this.inviteEmail);
        this.form.get('email')?.disable(); // ✅ disable invited email
      },
      error: () => {
        this.message.warning('Invite token is invalid or expired.');
      }
    });
  }

  // ✅ Auto-redirect if already logged in
  if (this.service.isLoggedIn()) {
    const claims = this.service.getClaims();
    if (claims) this.redirectUser(claims.globalRole);
  }
}


  passwordMatchValidator: ValidatorFn = (control: AbstractControl): null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
      } else {
        const errors = confirmPassword.errors;
        if (errors) {
          delete errors['passwordMismatch'];
          if (Object.keys(errors).length === 0) {
            confirmPassword.setErrors(null);
          }
        }
      }
    }
    return null;
  };

  hasDisplayableError(controlName: string): Boolean {
    const control = this.form.get(controlName);
    return (
      !!control &&
      control.invalid &&
      (this.isSubmitted || control.touched || control.dirty)
    );
  }

  submitForm(): void {
    this.isSubmitted = true;
  
    if (this.form.invalid) {
      this.message.error('Please fill all required fields correctly.');
      return;
    }
  
  const formData = {
  fullName: this.form.value.fullName,
  email: this.inviteEmail || this.form.value.email,
  password: this.form.value.password,
  confirmPassword: this.form.value.confirmPassword,
  inviteToken: this.inviteToken // ✅ send this to backend
};

  
    this.service.createUser(formData).subscribe({
      next: (res: any) => {
        this.message.success('Registration successful!');
        this.router.navigate(['/signin']);
      },
      error: (err: any) => {
        // Extract and show error message
        const errorMessage =
          err?.error?.message || 'An unexpected error occurred during registration.';
        this.message.error(errorMessage);
      }
    });
  }
  

  redirectUser(globalRole: string) {
    if (globalRole === 'SuperAdmin') {
      this.router.navigateByUrl('/dashboard');
    } else {
      this.router.navigateByUrl('/project-dashboard');
    }
  }
}
