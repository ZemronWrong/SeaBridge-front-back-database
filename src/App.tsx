import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InventoryModule } from './components/InventoryModule';
import { ProductionModule } from './components/ProductionModule';
import { PayrollModule } from './components/PayrollModule';
import { DTRModule } from './components/DTRModule';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Users, Shield, Crown } from 'lucide-react';
import type { UserRole } from './context/AuthContext';

type ViewId = 'dashboard' | 'inventory' | 'production' | 'payroll' | 'dtr';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const { user, loginAs } = useAuth();

  const handleQuickLogin = (role: UserRole) => {
    // Simple demo identities with sample employee/team mapping
    if (role === 'owner') {
      loginAs({
        id: 'USR-OWNER-001',
        name: 'Company Owner',
        role: 'owner',
      });
    } else if (role === 'manager') {
      loginAs({
        id: 'USR-MGR-TEAM-A',
        name: 'Team A Manager',
        role: 'manager',
        teamId: 'TEAM-A',
      });
    } else if (role === 'finance') {
      loginAs({
        id: 'USR-FIN-001',
        name: 'Payroll Officer',
        role: 'finance',
      });
    } else if (role === 'foreman') {
      loginAs({
        id: 'USR-FRM-001',
        name: 'Foreman',
        role: 'foreman',
        teamId: 'TEAM-A',
        employeeId: 'EMP-004',
      });
    } else {
      loginAs({
        id: 'USR-WRK-001',
        name: 'Juan dela Cruz',
        role: 'worker',
        teamId: 'TEAM-A',
        employeeId: 'EMP-001',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="max-w-4xl w-full px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Integrated Payroll & DTR System</CardTitle>
              <p className="text-sm text-gray-600">
                Choose a role to simulate the personalized dashboard and access permissions for the defense demo.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Employee View</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Access to personal DTR, payslips, and salary details only.
                  </p>
                  <Button className="mt-auto" onClick={() => handleQuickLogin('worker')}>
                    Login as Employee
                  </Button>
                </div>
                <div className="border rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Manager View</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    View and approve team DTR, overtime, and payroll summaries.
                  </p>
                  <Button className="mt-auto" onClick={() => handleQuickLogin('manager')}>
                    Login as Manager
                  </Button>
                </div>
                <div className="border rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="font-medium">Owner / CEO</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Full access with company-wide DTR and payroll analytics.
                  </p>
                  <Button className="mt-auto" onClick={() => handleQuickLogin('owner')}>
                    Login as Owner
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryModule />;
      case 'production':
        return <ProductionModule />;
      case 'payroll':
        return <PayrollModule />;
      case 'dtr':
        return <DTRModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {renderView()}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
