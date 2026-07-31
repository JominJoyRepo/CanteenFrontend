import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { StockEntry } from '../../models/models';

@Component({
  selector: 'app-stock-entry',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="stock-entry-page">
      <div class="page-header">
        <button mat-icon-button class="back-btn" (click)="goBack()" aria-label="Back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-text">
          <h2 class="page-title">{{ categoryName }}</h2>
          <p class="page-subtitle" *ngIf="!editDate">Enter open & closed stock</p>
          <p class="page-subtitle" *ngIf="editDate">Editing record for {{ editDate }}</p>
        </div>
      </div>

      <div class="items-list">
        <mat-card *ngFor="let item of stockItems; let i = index" class="item-card">
          <mat-card-content>
            <div class="item-header">
              <input
                *ngIf="isOtherCategory"
                class="item-name-input"
                type="text"
                [(ngModel)]="item.name"
                placeholder="Product name"
              >
              <span *ngIf="!isOtherCategory" class="item-name">{{ item.name }}</span>
              <span *ngIf="!isOtherCategory" class="item-unit">{{ item.unit }}</span>
              <span class="header-spacer"></span>
              <span class="price-section" *ngIf="!priceEditing.has(item.id)">
                <span class="price-value">₹{{ item.price ?? '-' }}</span>
                <button mat-icon-button class="price-btn" (click)="togglePriceEdit(item.id)" aria-label="Edit price">
                  <mat-icon>edit</mat-icon>
                </button>
              </span>
              <span class="price-section" *ngIf="priceEditing.has(item.id)">
                <mat-form-field appearance="outline" class="price-input">
                  <mat-label>Rate (₹)</mat-label>
                  <input matInput type="number" min="0" [(ngModel)]="item.price" placeholder="0">
                </mat-form-field>
                <button mat-icon-button class="price-btn confirm" (click)="confirmPriceEdit(item.id)" aria-label="Confirm price">
                  <mat-icon>check</mat-icon>
                </button>
              </span>
              <button
                *ngIf="isOtherCategory"
                mat-icon-button
                class="delete-btn"
                (click)="removeItem(i)"
                aria-label="Delete item"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <div class="input-row">
              <mat-form-field appearance="outline" class="stock-input">
                <mat-label>Open Stock</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="item.openStock" placeholder="0">
              </mat-form-field>
              <mat-form-field appearance="outline" class="stock-input">
                <mat-label>Closed Stock</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="item.closedStock" placeholder="0">
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <button
          *ngIf="isOtherCategory"
          mat-flat-button
          class="add-item-btn"
          (click)="addItem()"
        >
          <mat-icon>add</mat-icon>
          Add Item
        </button>
      </div>

      <div class="submit-container">
        <button
          mat-flat-button
          color="primary"
          class="submit-btn"
          (click)="submit()"
          [disabled]="submitting"
        >
          <mat-icon>check_circle</mat-icon>
          {{ submitting ? 'Saving...' : (editDate ? 'Update' : 'Submit') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .stock-entry-page {
      padding: 12px 16px 100px;
      max-width: 600px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 16px;
    }
    .back-btn {
      margin-top: -4px;
    }
    .header-text {
      flex: 1;
    }
    .page-title {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
    }
    .page-subtitle {
      color: #666;
      font-size: 13px;
      margin: 2px 0 0;
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .item-card {
      border-radius: 12px;
    }
    .item-card mat-card-content {
      padding: 14px;
    }
    .item-header {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 10px;
    }
    .item-name {
      font-size: 15px;
      font-weight: 500;
    }
    .item-name-input {
      flex: 1;
      min-width: 0;
      font-size: 15px;
      font-weight: 500;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 6px 10px;
      outline: none;
      transition: border-color 0.2s;
    }
    .item-name-input:focus {
      border-color: #1976d2;
    }
    .delete-btn {
      width: 28px;
      height: 28px;
      line-height: 28px;
      color: #c62828;
    }
    .delete-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      line-height: 18px;
    }
    .add-item-btn {
      width: 100%;
      height: 44px;
      border-radius: 12px;
      border: 1px dashed #1976d2;
      background: #f5faff;
      color: #1976d2;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .item-unit {
      font-size: 12px;
      color: #888;
    }
    .input-row {
      display: flex;
      gap: 10px;
    }
    .stock-input {
      flex: 1;
    }
    .submit-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 12px 16px;
      padding-bottom: max(12px, env(safe-area-inset-bottom));
      background: linear-gradient(transparent, #f5f5f5 30%);
      z-index: 100;
    }
    .submit-btn {
      width: 100%;
      max-width: 568px;
      margin: 0 auto;
      height: 50px;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 12px;
      display: flex;
    }
    .header-spacer {
      flex: 1;
    }
    .price-section {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .price-value {
      font-size: 13px;
      font-weight: 600;
      color: #e65100;
      background: #fff3e0;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .price-btn {
      width: 28px;
      height: 28px;
      line-height: 28px;
    }
    .price-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      line-height: 16px;
    }
    .price-btn.confirm {
      color: #2e7d32;
    }
    .price-input {
      width: 80px;
    }
    .price-input .mat-form-field-wrapper {
      padding-bottom: 0;
    }
  `]
})
export class StockEntryComponent implements OnInit {
  storeId = '';
  categoryId = '';
  categoryName = '';
  stockItems: StockEntry[] = [];
  submitting = false;
  editDate: string | null = null;
  selectedDate: string | null = null;
  priceEditing = new Set<string>();

  readonly OTHER_CATEGORY_ID = 'other';
  readonly OTHER_CATEGORY_NAME = 'Other Items';

  get isOtherCategory(): boolean {
    return this.categoryId === this.OTHER_CATEGORY_ID;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';
    const state = history.state;
    if (state?.categoryName) this.categoryName = state.categoryName;
    if (state?.editDate) this.editDate = state.editDate;
    if (state?.selectedDate) this.selectedDate = state.selectedDate;

    this.storeId = this.route.parent?.snapshot.params['storeId'] || '';
    this.loadForStore();

    this.route.parent?.params.subscribe(params => {
      const newStoreId = params['storeId'];
      if (newStoreId !== this.storeId) {
        this.storeId = newStoreId;
        this.editDate = null;
        this.categoryName = '';
        this.selectedDate = null;
        this.stockItems = [];
        this.loadForStore();
      }
    });
  }

  private loadForStore() {
    if (this.isOtherCategory) {
      this.categoryName = this.OTHER_CATEGORY_NAME;
      this.stockItems = [];
      if (this.editDate) {
        this.api.getRecords(this.storeId, this.editDate).subscribe(record => {
          const existing = record.entries?.find(e => e.categoryId === this.categoryId);
          if (existing) {
            this.stockItems = existing.items;
          }
        });
      } else {
        this.loadFromPrevious();
      }
      return;
    }
    if (this.editDate) {
      this.api.getRecords(this.storeId, this.editDate).subscribe(record => {
        const existing = record.entries?.find(e => e.categoryId === this.categoryId);
        if (existing) {
          this.categoryName = existing.categoryName;
          this.stockItems = existing.items;
        } else {
          this.loadTemplateItems();
        }
      });
    } else {
      this.loadFromPrevious();
    }
  }

  private loadFromPrevious() {
    const dateStr = this.selectedDate ?? this.formatDate(new Date());
    this.api.getPreviousRecord(this.storeId, dateStr).subscribe(prev => {
      if (prev === null) {
        if (!this.isOtherCategory) {
          this.loadTemplateItems();
        }
        return;
      }
      const prevEntry = (prev.entries || []).find(e => e.categoryId === this.categoryId);
      if (prevEntry) {
        if (!this.categoryName) {
          this.categoryName = prevEntry.categoryName;
        }
        this.stockItems = prevEntry.items.map(i => ({
          id: i.id,
          name: i.name,
          unit: i.unit,
          openStock: i.openStock ?? null,
          closedStock: null,
          price: i.price ?? null
        }));
      } else {
        this.stockItems = [];
      }
    });
  }

  private loadTemplateItems() {
    this.api.getItems(this.categoryId, this.storeId).subscribe(items => {
      if (!this.categoryName) {
        this.api.getCategories(this.storeId).subscribe(cats => {
          const cat = cats.find(c => c.id === this.categoryId);
          if (cat) this.categoryName = cat.name;
        });
      }
      this.stockItems = items.map(item => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        openStock: item.openStock ?? null,
        closedStock: null,
        price: item.price ?? null
      }));
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  goBack() {
    this.router.navigate(['/', this.storeId]);
  }

  togglePriceEdit(id: string) {
    this.priceEditing.add(id);
  }

  confirmPriceEdit(id: string) {
    this.priceEditing.delete(id);
    const item = this.stockItems.find(i => i.id === id);
    if (item && !this.isOtherCategory) {
      this.api.updateItemPrice(this.storeId, this.categoryId, id, item.price).subscribe();
    }
  }

  addItem() {
    this.stockItems.push({
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: '',
      unit: 'pcs',
      openStock: null,
      closedStock: null,
      price: null
    });
  }

  removeItem(index: number) {
    this.stockItems.splice(index, 1);
  }

  submit() {
    let itemsToSave = this.stockItems.map(i => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
      openStock: i.openStock,
      closedStock: i.closedStock,
      price: i.price
    }));
    if (this.isOtherCategory) {
      itemsToSave = itemsToSave.filter(i => i.name && i.name.trim().length > 0);
    }

    this.submitting = true;

    const request = this.editDate
      ? this.api.updateRecord(this.editDate, this.storeId, this.categoryId, itemsToSave)
      : this.api.submitRecord(this.storeId, this.categoryId, itemsToSave, this.selectedDate ?? undefined);

    request.subscribe({
      next: () => {
        this.snackBar.open('Saved successfully!', 'OK', { duration: 2000 });
        this.submitting = false;
        this.router.navigate(['/', this.storeId]);
      },
      error: () => {
        this.snackBar.open('Failed to save. Try again.', 'OK', { duration: 3000 });
        this.submitting = false;
      }
    });
  }
}
