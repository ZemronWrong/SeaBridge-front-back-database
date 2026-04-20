import { apiFetch } from './client';
import { Employee, PayrollRecord } from '../types/payroll';

export const payrollApi = {
  getEmployees: () => apiFetch('/employees/') as Promise<Employee[]>,
  
  getPayrollRecords: () => apiFetch('/payroll/') as Promise<PayrollRecord[]>,
  
  createPayroll: (payload: any) => apiFetch('/payroll/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as Promise<PayrollRecord>,
  
  updatePayrollStatus: (id: number, status: string) => apiFetch(`/payroll/${id}/update-status/`, {
    method: 'POST',
    body: JSON.stringify({ status })
  }) as Promise<PayrollRecord>,
};
