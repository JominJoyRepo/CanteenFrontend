import { Routes } from '@angular/router';
import { StoreSelectorComponent } from './components/store-selector/store-selector.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { StockEntryComponent } from './components/stock-entry/stock-entry.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
export const routes: Routes = [
  { path: '', redirectTo: 'select-store', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'select-store', component: StoreSelectorComponent, canActivate: [AuthGuard] },
  {
    path: ':storeId',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: CategoryListComponent },
      { path: 'category/:id', component: StockEntryComponent }
    ]
  }
];
