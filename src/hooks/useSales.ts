import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { salesApi } from '../api/sales.api';
import { Customer, Invoice } from '../types/sales';
import { Project } from '../types/project';

export function useSales() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, invRes, projRes] = await Promise.all([
        salesApi.getCustomers(),
        salesApi.getInvoices(),
        salesApi.getProjects()
      ]);
      setCustomers(custRes || []);
      setInvoices(invRes || []);
      setProjects(projRes || []);
    } catch (e: any) {
      toast.error('Failed to load CRM data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (payload: any) => {
    try {
      const saved = await salesApi.createCustomer(payload);
      setCustomers([saved, ...customers]);
      toast.success('Customer created successfully');
      return true;
    } catch (e: any) {
      toast.error('Failed to create customer: ' + e.message);
      return false;
    }
  };

  const createInvoice = async (payload: any) => {
    try {
      const saved = await salesApi.createInvoice(payload);
      setInvoices([saved, ...invoices]);
      toast.success('Invoice generated successfully');
      return true;
    } catch (e: any) {
      toast.error('Failed to generate invoice: ' + e.message);
      return false;
    }
  };

  const updateInvoiceStatus = async (id: number, status: string) => {
    try {
      const updated = await salesApi.updateInvoiceStatus(id, status);
      setInvoices(invoices.map(inv => inv.id === id ? updated : inv));
      toast.success(`Invoice updated to ${status}`);
    } catch (e: any) {
      toast.error('Failed to update: ' + e.message);
    }
  };

  return {
    customers,
    invoices,
    projects,
    loading,
    createCustomer,
    createInvoice,
    updateInvoiceStatus,
    refreshData: fetchData
  };
}
