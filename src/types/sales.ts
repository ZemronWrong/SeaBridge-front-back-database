export interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  preferences: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer: number;
  customer_name: string;
  project?: number | null;
  project_name?: string;
  project_code?: string;
  amount_due: string | number;
  status: string;
  issued_date: string;
  due_date: string;
  notes: string;
}
