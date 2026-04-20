import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { payrollApi } from '../api/payroll.api';
import { Employee, PayrollRecord } from '../types/payroll';

export function usePayroll() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, prRes] = await Promise.all([
        payrollApi.getEmployees(),
        payrollApi.getPayrollRecords()
      ]);
      setEmployees(empRes || []);
      setRecords(prRes || []);
    } catch (e: any) {
      toast.error('Failed to load payroll data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const createPayroll = async (payload: any) => {
    try {
      const saved = await payrollApi.createPayroll(payload);
      setRecords([saved, ...records]);
      toast.success('Payroll generated successfully');
      return true;
    } catch (e: any) {
      toast.error('Failed to generate payroll: ' + e.message);
      return false;
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const updated = await payrollApi.updatePayrollStatus(id, status);
      setRecords(records.map(r => r.id === id ? updated : r));
      toast.success(`Payroll marked as ${status}`);
    } catch (e: any) {
      toast.error('Failed to update: ' + e.message);
    }
  };

  return {
    employees,
    records,
    loading,
    createPayroll,
    updateStatus,
    refreshData: fetchData
  };
}
