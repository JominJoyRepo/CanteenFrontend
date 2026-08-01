import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '../../models/models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { DateStateService } from '../../services/date-state.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, MatToolbarModule,
    MatButtonModule, MatIconModule, MatMenuModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="layout">
      <mat-toolbar color="primary" class="toolbar">
        <button mat-button [matMenuTriggerFor]="storeMenu" class="store-btn">
          <span class="store-label">{{ currentStoreName }}</span>
          <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
        </button>
        <mat-menu #storeMenu="matMenu" class="store-menu">
          <button mat-menu-item *ngFor="let store of stores" (click)="switchStore(store.id)">
            <mat-icon *ngIf="store.id === currentStoreId">check</mat-icon>
            <span [class.selected]="store.id === currentStoreId">{{ store.name }}</span>
          </button>
        </mat-menu>

        <span class="spacer"></span>

        <button mat-button class="date-btn" (click)="datepicker.open()">
          <mat-icon class="date-icon">calendar_today</mat-icon>
          <span class="date-label">{{ formattedDate }}</span>
          <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
        </button>
        <input [matDatepicker]="datepicker" (dateChange)="onDateChange($event.value)" style="display:none">
        <mat-datepicker #datepicker></mat-datepicker>

        <button mat-icon-button (click)="logout()" class="logout-btn" [title]="'Sign out (' + username + ')'" aria-label="Sign out">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      padding: 0 12px;
      height: 56px;
    }
    .store-btn {
      font-size: 15px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 12px;
      min-width: 0;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.12);
      transition: background 0.2s ease;
    }
    .store-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .store-label {
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dropdown-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .spacer {
      flex: 1;
    }
    .date-btn {
      font-size: 15px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 12px;
      min-width: 0;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.12);
      transition: background 0.2s ease;
    }
    .date-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .date-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-right: 2px;
    }
    .date-label {
      font-size: 14px;
      white-space: nowrap;
    }
    .logout-btn {
      color: rgba(255, 255, 255, 0.9);
    }
    .content {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .toolbar {
        gap: 4px;
        padding: 0 8px;
      }
      .store-label {
        max-width: 80px;
      }
      .date-label {
        font-size: 13px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  stores: Store[] = [];
  currentStoreId = '';
  selectedDate: Date = new Date();

  get currentStoreName(): string {
    return this.stores.find(s => s.id === this.currentStoreId)?.name || 'Select Store';
  }

  get formattedDate(): string {
    return this.selectedDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dateState: DateStateService,
    private api: ApiService,
    private auth: AuthService
  ) {}

  get username(): string {
    return this.auth.currentUsername || '';
  }

  ngOnInit() {
    this.currentStoreId = this.route.snapshot.params['storeId'];
    this.api.getStores().subscribe(stores => this.stores = stores);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentStoreId = this.route.snapshot.params['storeId'];
    });
  }

  onDateChange(date: Date) {
    this.selectedDate = date;
    this.dateState.setDate(date);
  }

  switchStore(storeId: string) {
    if (storeId === this.currentStoreId) return;
    const segments = this.router.url.split('/').filter(Boolean);
    if (segments.length >= 2) {
      this.router.navigate(['/', storeId, ...segments.slice(1)]);
    } else {
      this.router.navigate(['/', storeId]);
    }
  }

  logout() {
    this.auth.logout();
  }
}