import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

const TOKEN_KEY = 'canteen_token';
const USER_KEY = 'canteen_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = localStorage.getItem(TOKEN_KEY);
  private username: string | null = localStorage.getItem(USER_KEY);
  private loggedInSubject = new BehaviorSubject<boolean>(!!this.token);

  loggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {}

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get currentUsername(): string | null {
    return this.username;
  }

  login(username: string, password: string): Observable<{ token: string; username: string }> {
    return this.api.login(username, password).pipe(
      tap(res => {
        this.token = res.token;
        this.username = res.username;
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, res.username);
        this.loggedInSubject.next(true);
      })
    );
  }

  logout(): void {
    const token = this.token;
    this.token = null;
    this.username = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.loggedInSubject.next(false);
    if (token) {
      this.api.logout(token).subscribe({
        error: () => {}
      });
    }
    this.router.navigate(['/login']);
  }
}
