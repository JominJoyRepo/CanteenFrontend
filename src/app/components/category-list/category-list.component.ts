import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { DateStateService } from '../../services/date-state.service';
import { Subscription } from 'rxjs';

interface CategoryDisplay {
  id: string;
  name: string;
  hasEntry: boolean;
  items: {
    id: string;
    name: string;
    unit: string;
    price: number | null;
    openStock: number | null;
    closedStock: number | null;
  }[];
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule, MatSnackBarModule],
  template: `
    <div class="category-page">
      <div class="page-heading">
        <h2 class="page-title">Stock Records</h2>
      </div>

      <mat-tab-group (selectedTabChange)="onTabChange($event)">
        <mat-tab label="Stock Records">
          <ng-template matTabContent>
            <div *ngIf="loading" class="empty-state">
              <p>Loading...</p>
            </div>

            <div *ngIf="!loading && categoriesWithItems.length === 0" class="empty-state">
              <mat-icon>inventory_2</mat-icon>
              <p>No categories found</p>
            </div>

            <div *ngIf="!loading" class="category-grid">
              <mat-card
                *ngFor="let cat of categoriesWithItems"
                class="category-card"
                (click)="selectCategory(cat)"
              >
                <mat-card-content>
                  <div class="entry-header">
                    <mat-icon class="category-icon">inventory_2</mat-icon>
                    <span class="category-name">{{ cat.name }}</span>
                    <mat-icon class="chevron">chevron_right</mat-icon>
                  </div>
                  <div class="item-table">
                    <div class="item-row" *ngFor="let item of cat.items">
                      <span class="item-label">{{ item.name }} <span class="item-unit">{{ item.unit }}</span></span>
                      <span class="stock-values">
                        <span class="stock-badge price">₹{{ item.price ?? '-' }}</span>
                        <span class="stock-badge open" *ngIf="item.openStock !== null">OS: {{ item.openStock }}</span>
                        <span class="stock-badge closed" *ngIf="item.closedStock !== null">CS: {{ item.closedStock }}</span>
                      </span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="save-day-container" *ngIf="!loading">
              <button
                mat-flat-button
                color="primary"
                class="save-day-btn"
                (click)="saveDay()"
                [disabled]="savingDay"
              >
                <mat-icon>save_alt</mat-icon>
                {{ savingDay ? 'Saving...' : 'Save Day' }}
              </button>
              <p class="save-day-hint">Saves all categories for this day</p>
            </div>
          </ng-template>
        </mat-tab>

        <mat-tab label="Calculation">
          <ng-template matTabContent>
            <div class="summary-panel">
              <div class="diff-card">
                <span class="diff-label">Difference (Net Value)</span>
                <span class="diff-value">₹{{ diffValue }}</span>
                <span class="diff-formula">(cash out − cash in) + card sale − stock value</span>
              </div>

              <div class="total-row">
                <span class="total-row-label">Total Stock Value</span>
                <span class="total-row-value">₹{{ totalValue }}</span>
                <span class="total-row-note">(openStock − closedStock) × price</span>
              </div>

              <div class="summary-fields">
                <div class="field-group">
                  <label class="field-label">Cash In (₹)</label>
                  <input class="field-input" type="number" min="0" [(ngModel)]="cashIn" placeholder="0">
                </div>
                <div class="field-group">
                  <label class="field-label">Cash Out (₹)</label>
                  <input class="field-input" type="number" min="0" [(ngModel)]="cashOut" placeholder="0">
                </div>
                <div class="field-group">
                  <label class="field-label">Card Sale (₹)</label>
                  <input class="field-input" type="number" min="0" [(ngModel)]="cardSale" placeholder="0">
                </div>
              </div>

              <button
                mat-flat-button
                color="primary"
                class="save-btn"
                (click)="saveSummary()"
                [disabled]="savingSummary"
              >
                <mat-icon>save</mat-icon>
                {{ savingSummary ? 'Saving...' : 'Save Summary' }}
              </button>
            </div>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .category-page {
      padding: 12px 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    .page-heading {
      margin-bottom: 12px;
    }
    .page-title {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
    }
    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: #999;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .category-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .category-card {
      cursor: pointer;
      border-radius: 12px;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .category-card:active {
      transform: scale(0.98);
    }
    .category-card mat-card-content {
      padding: 12px 14px;
    }
    .entry-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0 8px;
    }
    .category-icon {
      color: #1976d2;
    }
    .category-name {
      flex: 1;
      font-size: 15px;
      font-weight: 500;
    }
    .chevron {
      color: #999;
    }
    .item-table {
      border-top: 1px solid #eee;
      padding-top: 8px;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      font-size: 13px;
    }
    .item-label {
      color: #444;
    }
    .item-unit {
      color: #999;
      font-size: 11px;
    }
    .stock-values {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }
    .stock-badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      min-width: 44px;
      text-align: center;
    }
    .stock-badge.open {
      background: #e3f2fd;
      color: #1565c0;
    }
    .stock-badge.closed {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .stock-badge.price {
      background: #fff3e0;
      color: #e65100;
    }

    .summary-panel {
      padding: 16px 0;
    }
    .diff-card {
      background: linear-gradient(135deg, #1976d2, #1565c0);
      color: #fff;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 12px;
    }
    .diff-label {
      display: block;
      font-size: 13px;
      opacity: 0.85;
      margin-bottom: 6px;
    }
    .diff-value {
      display: block;
      font-size: 32px;
      font-weight: 700;
    }
    .diff-formula {
      display: block;
      font-size: 11px;
      opacity: 0.7;
      margin-top: 6px;
    }
    .total-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 10px 14px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .total-row-label {
      font-size: 13px;
      color: #555;
    }
    .total-row-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .total-row-note {
      font-size: 11px;
      color: #999;
      margin-left: auto;
    }
    .summary-fields {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 24px;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .field-label {
      font-size: 13px;
      font-weight: 500;
      color: #555;
    }
    .field-input {
      padding: 10px 14px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    .field-input:focus {
      border-color: #1976d2;
    }
    .save-btn {
      width: 100%;
      height: 50px;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 12px;
    }

    .save-day-container {
      margin-top: 16px;
      text-align: center;
    }
    .save-day-btn {
      width: 100%;
      max-width: 568px;
      height: 50px;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 12px;
    }
    .save-day-hint {
      font-size: 11px;
      color: #999;
      margin: 6px 0 0;
    }
  `]
})
export class CategoryListComponent implements OnInit, OnDestroy {
  categoriesWithItems: CategoryDisplay[] = [];
  storeId = '';
  selectedDate: Date = new Date();
  loading = false;
  cashIn: number | null = null;
  cashOut: number | null = null;
  cardSale: number | null = null;
  savingSummary = false;
  savingDay = false;
  private dateSub: Subscription | null = null;

  readonly otherCategory = { id: 'other', name: 'Other Items' };

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private dateState: DateStateService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
      this.storeId = params['storeId'];
      this.selectedDate = new Date();
      this.loadData();
    });
    this.dateSub = this.dateState.selectedDate$.subscribe(date => {
      this.selectedDate = date;
      if (this.storeId) this.loadData();
    });
  }

  ngOnDestroy() {
    this.dateSub?.unsubscribe();
  }

  get totalValue(): number {
    let total = 0;
    for (const cat of this.categoriesWithItems) {
      for (const item of cat.items) {
        if (item.openStock !== null && item.closedStock !== null && item.price !== null) {
          total += (item.openStock - item.closedStock) * item.price;
        }
      }
    }
    return total;
  }

  get diffValue(): number {
    const cashIn = this.cashIn ?? 0;
    const cashOut = this.cashOut ?? 0;
    const cardSale = this.cardSale ?? 0;
    return (cashOut - cashIn) + cardSale - this.totalValue;
  }

  private loadData() {
    this.loading = true;
    const dateStr = this.formatDate(this.selectedDate);
    this.api.getCategoriesWithPrices(this.storeId).subscribe(cats => {
      this.api.getRecords(this.storeId, dateStr).subscribe(record => {
        const entries = record.entries || [];
        this.api.getPreviousRecord(this.storeId, dateStr).subscribe(prev => {
          const prevEntries = prev?.entries || [];
          this.categoriesWithItems = cats.map(cat => {
            const entry = entries.find(e => e.categoryId === cat.id);
            if (entry) {
              return {
                ...cat,
                hasEntry: true,
                items: cat.items.map(tItem => {
                  const eItem = entry.items.find(ei => ei.id === tItem.id);
                  return {
                    ...tItem,
                    openStock: eItem?.openStock ?? null,
                    closedStock: eItem?.closedStock ?? null,
                    price: eItem?.price ?? tItem.price,
                  };
                })
              };
            }
            const prevEntry = prevEntries.find(e => e.categoryId === cat.id);
            if (prevEntry) {
              return {
                ...cat,
                hasEntry: false,
                items: cat.items.map(tItem => {
                  const pItem = prevEntry.items.find(pi => pi.id === tItem.id);
                  return {
                    ...tItem,
                    openStock: pItem?.openStock ?? null,
                    closedStock: null,
                    price: pItem?.price ?? tItem.price,
                  };
                })
              };
            }
            return {
              ...cat,
              hasEntry: false,
              items: cat.items.map(tItem => ({
                ...tItem,
                openStock: null,
                closedStock: null,
              }))
            };
          });
          const otherEntry = entries.find(e => e.categoryId === this.otherCategory.id);
          const prevOtherEntry = prevEntries.find(e => e.categoryId === this.otherCategory.id);
          this.categoriesWithItems.push({
            id: this.otherCategory.id,
            name: this.otherCategory.name,
            hasEntry: !!otherEntry,
            items: otherEntry ? otherEntry.items : (prevOtherEntry ? prevOtherEntry.items.map(i => ({ ...i, closedStock: null })) : [])
          });
          if (record.summary) {
            this.cashIn = record.summary.cashIn;
            this.cashOut = record.summary.cashOut;
            this.cardSale = record.summary.cardSale;
          } else {
            this.cashIn = null;
            this.cashOut = null;
            this.cardSale = null;
          }
          this.loading = false;
        });
      });
    });
  }

  onTabChange(event: any) {
    if (event.index === 1) {
      const dateStr = this.formatDate(this.selectedDate);
      this.api.getRecords(this.storeId, dateStr).subscribe(record => {
        if (record.summary) {
          this.cashIn = record.summary.cashIn;
          this.cashOut = record.summary.cashOut;
          this.cardSale = record.summary.cardSale;
        }
      });
    }
  }

  selectCategory(cat: CategoryDisplay) {
    if (cat.hasEntry) {
      const dateStr = this.formatDate(this.selectedDate);
      this.router.navigate(['/', this.storeId, 'category', cat.id], {
        state: { editDate: dateStr, categoryName: cat.name, selectedDate: dateStr }
      });
    } else {
      const dateStr = this.formatDate(this.selectedDate);
      this.router.navigate(['/', this.storeId, 'category', cat.id], {
        state: { categoryName: cat.name, selectedDate: dateStr }
      });
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  saveDay() {
    const dateStr = this.formatDate(this.selectedDate);
    const entries = this.categoriesWithItems.map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      items: cat.items.map(i => ({
        id: i.id,
        name: i.name,
        unit: i.unit,
        openStock: i.openStock,
        closedStock: i.closedStock,
        price: i.price
      }))
    }));
    this.savingDay = true;
    this.api.saveDayRecord(this.storeId, dateStr, entries).subscribe({
      next: () => {
        this.snackBar.open('Day saved!', 'OK', { duration: 2000 });
        this.savingDay = false;
        this.loadData();
      },
      error: () => {
        this.snackBar.open('Failed to save. Try again.', 'OK', { duration: 3000 });
        this.savingDay = false;
      }
    });
  }

  saveSummary() {
    const dateStr = this.formatDate(this.selectedDate);
    this.savingSummary = true;
    this.api.saveSummary(this.storeId, dateStr, {
      cashIn: this.cashIn,
      cashOut: this.cashOut,
      cardSale: this.cardSale,
      diff: this.diffValue
    }).subscribe({
      next: () => {
        this.snackBar.open('Summary saved!', 'OK', { duration: 2000 });
        this.savingSummary = false;
      },
      error: () => {
        this.snackBar.open('Failed to save. Try again.', 'OK', { duration: 3000 });
        this.savingSummary = false;
      }
    });
  }
}