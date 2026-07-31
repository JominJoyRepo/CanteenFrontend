export interface Store {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  unit: string;
  openStock?: number | null;
  price?: number | null;
}

export interface StockEntry {
  id: string;
  name: string;
  unit: string;
  openStock: number | null;
  closedStock: number | null;
  price: number | null;
}

export interface CategoryEntry {
  categoryId: string;
  categoryName: string;
  items: StockEntry[];
}

export interface DailySummary {
  cashIn: number | null;
  cashOut: number | null;
  cardSale: number | null;
  diff?: number | null;
}

export interface DayRecord {
  date: string;
  storeId?: string;
  entries: CategoryEntry[];
  summary?: DailySummary;
}
