import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DateStateService {
  private dateSubject = new BehaviorSubject<Date>(new Date());
  selectedDate$: Observable<Date> = this.dateSubject.asObservable();

  setDate(date: Date) {
    this.dateSubject.next(date);
  }
}