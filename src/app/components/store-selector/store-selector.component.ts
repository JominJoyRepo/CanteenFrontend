import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Store } from '../../models/models';

@Component({
  selector: 'app-store-selector',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="store-page">
      <h1 class="page-title">Stock Recording</h1>
      <p class="page-subtitle">Select a store to begin</p>
      <div class="store-grid">
        <mat-card
          *ngFor="let store of stores"
          class="store-card"
          (click)="selectStore(store)"
        >
          <mat-card-content>
            <mat-icon class="store-icon">store</mat-icon>
            <span class="store-name">{{ store.name }}</span>
            <mat-icon class="chevron">chevron_right</mat-icon>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .store-page {
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    .page-title {
      font-size: 24px;
      font-weight: 500;
      margin: 8px 0 4px;
      text-align: center;
    }
    .page-subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .store-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .store-card {
      cursor: pointer;
      border-radius: 12px;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .store-card:active {
      transform: scale(0.98);
    }
    .store-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 20px 16px;
      gap: 12px;
    }
    .store-icon {
      color: #1976d2;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .store-name {
      flex: 1;
      font-size: 18px;
      font-weight: 500;
    }
    .chevron {
      color: #999;
    }
  `]
})
export class StoreSelectorComponent implements OnInit {
  stores: Store[] = [];

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.api.getStores().subscribe(stores => this.stores = stores);
  }

  selectStore(store: Store) {
    this.router.navigate(['/', store.id]);
  }
}
