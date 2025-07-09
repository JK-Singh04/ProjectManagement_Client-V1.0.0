//login.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message'; // ✅ NEW import

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  passwordVisible = false;
  isSubmitted = false;
  form: any;

  constructor(
    public formBuilder: FormBuilder,
    private service: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    if (this.service.isLoggedIn()){
      const claims = this.service.getClaims();
      if (claims) this.redirectUser(claims.globalRole);
    } 
  } 

  hasDisplayableError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control?.invalid && (this.isSubmitted || control?.touched || control?.dirty);
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.form.invalid) {
      this.message.error('Please enter valid email and password.');
      return;
    }

    this.service.signin(this.form.value).subscribe({
      next: (res: any) => {
        this.message.success('Login successful!');
        this.service.clearSessionState();
        this.service.setToken(res.token); // Single source of truth
        const claims = this.service.getClaims(); 

        if (claims) this.redirectUser(claims.globalRole);
        else this.message.warning('Could not extract user claims from token'); 
      },
      error: (err: HttpErrorResponse) => {
        const errorMessage = err?.error?.message || 'Login failed. Please try again.';
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