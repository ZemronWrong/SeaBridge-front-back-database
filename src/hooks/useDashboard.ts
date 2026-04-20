import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { inventoryApi } from '../api/inventory.api';
import { productionApi } from '../api/production.api';
import { payrollApi } from '../api/payroll.api';
import { dtrApi } from '../api/dtr.api';
import { DashboardMetrics } from '../types/dashboard';

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMaterials: 0,
    activeProjects: 0,
    activeWorkers: 0,
    monthlyPayroll: 0,
    lowStockItems: [],
    projects: [],
    qualityChecks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [materials, projects, payroll, dtr, qc] = await Promise.all([
        inventoryApi.getMaterials().catch(() => []),
        productionApi.getProjects().catch(() => []),
        payrollApi.getPayrollRecords().catch(() => []),
        dtrApi.getRecords().catch(() => []),
        productionApi.getQualityChecks().catch(() => []),
      ]);

      const lowStock = materials.filter((m: any) => (m.quantity || 0) <= (m.min_stock || 0));
      const activeProjs = projects.filter((p: any) => p.status !== 'Completed');
      const today = new Date().toLocaleDateString('en-CA');
      const activeWrks = dtr.filter((d: any) => d.date === today && d.status === 'Present').length;
      
      // Calculate current month's payroll sum
      const currentMonth = new Date().toISOString().substring(0, 7);
      const monthlyPay = payroll
        .filter((r: any) => r.period === currentMonth)
        .reduce((sum: number, r: any) => sum + Number(r.net_pay || 0), 0);

      setMetrics({
        totalMaterials: materials.length,
        activeProjects: activeProjs.length,
        activeWorkers: activeWrks || 24, // Fallback for UI demo if no DTR yet
        monthlyPayroll: monthlyPay,
        lowStockItems: lowStock.slice(0, 5), // Only show top 5 alerts
        projects: projects.slice(0, 4),
        qualityChecks: qc.slice(0, 4)
      });
    } catch (e: any) {
      console.error('Failed to fetch dashboard data:', e);
      toast.error('Failed to load dashboard: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, refreshData: fetchDashboardData };
}
