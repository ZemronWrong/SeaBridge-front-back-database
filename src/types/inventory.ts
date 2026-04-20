export interface Material {
  id: number;
  material_id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  unit_price: string | number;
  supplier: string | number;
  supplier_name?: string;
  last_updated: string;
  total_value?: string | number;
  stock_status?: string;
  stock_percentage?: number;
  reorder_point?: number;
  lead_time_days?: number;
  avg_daily_usage?: string | number;
  custom_reorder_point?: string | number | null;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

export interface MaterialRequest {
  id: number;
  material: number;
  material_name: string;
  quantity: number;
  project: number;
  project_name: string;
  requester: number;
  requester_name: string;
  status: string;
  required_date: string;
  notes: string;
  created_at: string;
}

export interface PurchaseOrderItem {
  material: number;
  material_name?: string;
  quantity: number;
  unit_price: number | string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier: number;
  supplier_name: string;
  created_by: number;
  created_by_name: string;
  status: string;
  expected_delivery: string;
  total_cost: number | string;
  created_at: string;
  items: PurchaseOrderItem[];
}
