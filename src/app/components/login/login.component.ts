import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card">
        <mat-card-content>
          <div class="login-header">
            <mat-icon class="login-logo">store</mat-icon>
            <h1 class="login-title">Stock Recording</h1>
            <p class="login-subtitle">Sign in to continue</p>
          </div>

          <form #loginForm="ngForm" (ngSubmit)="onLogin()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput name="username" [(ngModel)]="username" required autocomplete="username">
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput name="password" [type]="showPassword ? 'text' : 'password'"
                     [(ngModel)]="password" required autocomplete="current-password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword"
                      [attr.aria-label]="'Toggle password visibility'">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message">
              <mat-icon>error</mat-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <button mat-raised-button color="primary" class="full-width login-btn"
                    type="submit" [disabled]="loginForm.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="20" class="spinner"></mat-spinner>
              <span *ngIf="!loading">Sign In</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
      padding: 16px;
    }
    .login-card {
      width: 100%;
      max-width: 380px;
      border-radius: 16px;
      padding: 8px 8px 16px;
    }
    .login-header {
      text-align: center;
      margin: 16px 0 24px;
    }
    .login-logo {
      font-size: 44px;
      width: 44px;
      height: 44px;
      color: #1976d2;
    }
    .login-title {
      font-size: 22px;
      font-weight: 500;
      margin: 8px 0 4px;
    }
    .login-subtitle {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 0 8px;
    }
    .full-width {
      width: 100%;
    }
    .login-btn {
      margin-top: 8px;
      height: 44px;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .spinner {
      margin: 0 auto;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;
      background: #fdecea;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
    }
    .error-message mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/select-store']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.detail === 'Invalid username or password'
          ? 'Invalid username or password'
          : 'Login failed. Please try again.';
      }
    });
  }
}
