import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Item, DayRecord, Store } from '../models/models';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base: string;

  constructor(private http: HttpClient, config: ConfigService) {
    this.base = config.apiUrl;
  }

  getStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.base}/stores`);
  }

  getCategories(storeId: string): Observable<Category[]> {
    const params = new HttpParams().set('storeId', storeId);
    return this.http.get<Category[]>(`${this.base}/categories`, { params });
  }

  getItems(categoryId: string, storeId: string): Observable<Item[]> {
    const params = new HttpParams().set('storeId', storeId);
    return this.http.get<Item[]>(`${this.base}/categories/${categoryId}/items`, { params });
  }

  getRecords(storeId: string, date?: string): Observable<DayRecord> {
    let params = new HttpParams().set('storeId', storeId);
    if (date) params = params.set('date', date);
    return this.http.get<DayRecord>(`${this.base}/records`, { params });
  }

  submitRecord(storeId: string, categoryId: string, items: { id: string; name: string; unit: string; openStock: number | null; closedStock: number | null; price: number | null }[], date?: string): Observable<any> {
    return this.http.post(`${this.base}/records`, { storeId, categoryId, items, ...(date && { date }) });
  }

  updateRecord(date: string, storeId: string, categoryId: string, items: any[]): Observable<any> {
    return this.http.put(`${this.base}/records/${date}`, { storeId, categoryId, items });
  }

  getAvailableDates(storeId: string): Observable<string[]> {
    const params = new HttpParams().set('storeId', storeId);
    return this.http.get<string[]>(`${this.base}/records/dates`, { params });
  }

  getPreviousRecord(storeId: string, date: string): Observable<DayRecord | null> {
    const params = new HttpParams().set('storeId', storeId).set('date', date);
    return this.http.get<DayRecord | null>(`${this.base}/records/previous`, { params });
  }

  saveSummary(storeId: string, date: string, summary: { cashIn: number | null; cashOut: number | null; cardSale: number | null; diff?: number }): Observable<any> {
    return this.http.put(`${this.base}/records/${date}/summary`, { storeId, ...summary });
  }

  getCategoriesWithPrices(storeId: string): Observable<{ id: string; name: string; items: { id: string; name: string; unit: string; price: number | null }[] }[]> {
    const params = new HttpParams().set('storeId', storeId);
    return this.http.get<any[]>(`${this.base}/categories/with-prices`, { params });
  }

  updateItemPrice(storeId: string, categoryId: string, itemId: string, price: number | null): Observable<any> {
    return this.http.put(`${this.base}/categories/${categoryId}/items/${itemId}/price`, { storeId, price });
  }

  login(username: string, password: string): Observable<{ token: string; username: string }> {
    return this.http.post<{ token: string; username: string }>(`${this.base}/auth/login`, { username, password });
  }

  logout(token: string): Observable<any> {
    return this.http.post(`${this.base}/auth/logout`, { token });
  }
}
