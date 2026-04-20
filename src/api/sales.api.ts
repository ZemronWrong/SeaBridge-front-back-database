import { apiFetch } from './client';
import { Customer, Invoice } from '../types/sales';
import { Project } from '../types/project';

export const salesApi = {
  getCustomers: () => apiFetch('/customers/') as Promise<Customer[]>,
  
  createCustomer: (payload: any) => apiFetch('/customers/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as Promise<Customer>,

  getInvoices: () => apiFetch('/invoices/') as Promise<Invoice[]>,
  
  createInvoice: (payload: any) => apiFetch('/invoices/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as Promise<Invoice>,
  
  updateInvoiceStatus: (id: number, status: string) => apiFetch(`/invoices/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }) as Promise<Invoice>,
  
  getProjects: () => apiFetch('/projects/') as Promise<Project[]>,
};
