export interface ExpenditureRow { month: string; total: number; }
export interface ProductionRow { name: string; label: string; progress: number; status: string; overdue: boolean; }
export interface InventoryRow { category: string; value: number; }
export interface InvoiceRow { status: string; count: number; }

export interface AnalyticsData {
  expenditures: ExpenditureRow[];
  production: ProductionRow[];
  inventory: InventoryRow[];
  invoices: InvoiceRow[];
}
