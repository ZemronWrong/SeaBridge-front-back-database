export interface Employee {
  id: number;
  employee_id: string;
  first_name?: string;
  last_name?: string;
  name: string;
  position: string;
  daily_rate: string | number;
  employment_type: 'Regular' | 'Contractual';
  team_id: string;
}

export interface PayrollRecord {
  id: number;
  payroll_id: string;
  employee: number;
  employee_name: string;
  position: string;
  period: string;
  days_worked: number;
  daily_rate: string | number;
  gross_pay: string | number;
  deductions: string | number;
  net_pay: string | number;
  status: 'Pending' | 'Processed' | 'Paid';
  created_date: string;
}
