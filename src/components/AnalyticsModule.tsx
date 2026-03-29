import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Factory, Package, Receipt, AlertTriangle, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../api';

interface ExpenditureRow { month: string; total: number; }
interface ProductionRow  { name: string; label: string; progress: number; status: string; overdue: boolean; }
interface InventoryRow   { category: string; value: number; }
interface InvoiceRow     { status: string; count: number; }

interface AnalyticsData {
  expenditures: ExpenditureRow[];
  production:   ProductionRow[];
  inventory:    InventoryRow[];
  invoices:     InvoiceRow[];
}

const PIE_COLORS = ['#1e40af', '#0891b2', '#0284c7', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'];
const INVOICE_COLORS: Record<string, string> = {
  Draft: '#6b7280',
  Sent:  '#3b82f6',
  Paid:  '#22c55e',
  Overdue: '#ef4444',
};

export function AnalyticsModule() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/analytics/dashboard/')
      .then((d: AnalyticsData) => setData(d))
      .catch((e: any) => toast.error('Failed to load analytics: ' + e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  const totalExpenditure = data?.expenditures.reduce((s, r) => s + r.total, 0) || 0;
  const totalInventoryValue = data?.inventory.reduce((s, r) => s + r.value, 0) || 0;
  const overdueProjects = data?.production.filter(p => p.overdue).length || 0;
  const paidInvoices = data?.invoices.find(i => i.status === 'Paid')?.count || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BarChart2 className="w-7 h-7 text-blue-800" /> Analytics & Reports
        </h1>
        <p className="text-gray-600">Executive overview of your manufacturing operations.</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Procurement</p>
            <p className="text-2xl font-bold mt-1">₱{totalExpenditure.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">From received POs</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Inventory Value</p>
            <p className="text-2xl font-bold mt-1">₱{totalInventoryValue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Capital tied up in stock</p>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${overdueProjects > 0 ? 'border-l-red-500' : 'border-l-gray-300'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Overdue Projects</p>
                <p className={`text-2xl font-bold mt-1 ${overdueProjects > 0 ? 'text-red-600' : ''}`}>{overdueProjects}</p>
                <p className="text-xs text-gray-400 mt-1">Past deadline</p>
              </div>
              {overdueProjects > 0 && <AlertTriangle className="w-8 h-8 text-red-400" />}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Paid Invoices</p>
            <p className="text-2xl font-bold mt-1">{paidInvoices}</p>
            <p className="text-xs text-gray-400 mt-1">Completed billing</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Chart Row 1: Expenditure Trends ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Expenditure Trends — Monthly Procurement Costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.expenditures.length ?? 0) === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No received Purchase Orders to display. Mark a PO as "Received" to see data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data!.expenditures} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="expendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1e40af" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`₱${v.toLocaleString()}`, 'Total Spend']} />
                <Area type="monotone" dataKey="total" stroke="#1e40af" strokeWidth={2} fill="url(#expendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Chart Row 2: Production Efficiency + Inventory Value ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Production Efficiency Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-600" />
              Production Efficiency — Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.production.length ?? 0) === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">No projects found.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data!.production} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number, _: string, entry: any) => [
                      `${v}% – ${entry.payload.status}${entry.payload.overdue ? ' ⚠ OVERDUE' : ''}`,
                      entry.payload.label
                    ]}
                  />
                  <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                    {data!.production.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.overdue ? '#ef4444' : entry.progress >= 75 ? '#22c55e' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Inventory Valuation Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Inventory Valuation — Capital by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.inventory.length ?? 0) === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">No inventory data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data!.inventory}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data!.inventory.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [`₱${v.toLocaleString()}`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Invoice Status Summary ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            Invoice Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.invoices.length ?? 0) === 0 ? (
            <div className="text-gray-400 text-center py-6">No invoices generated yet.</div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center py-2">
              {data!.invoices.map(inv => (
                <div key={inv.status} className="text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto"
                    style={{ backgroundColor: INVOICE_COLORS[inv.status] || '#6b7280' }}
                  >
                    {inv.count}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-700">{inv.status}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
