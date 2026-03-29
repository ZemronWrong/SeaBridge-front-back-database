import { Ship, LayoutDashboard, Package, ClipboardCheck, Wallet, User, Clock, Briefcase, BarChart2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: any) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { user, logout } = useAuth();
  const userRole = user?.role ?? 'worker';

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'finance', 'foreman', 'worker'] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: ['owner', 'manager', 'finance', 'foreman'] },
    { id: 'production', label: 'Production & QC', icon: ClipboardCheck, roles: ['owner', 'manager', 'foreman', 'worker'] },
    { id: 'dtr', label: 'DTR & Attendance', icon: Clock, roles: ['owner', 'manager', 'finance', 'foreman', 'worker'] },
    { id: 'payroll', label: 'Payroll & Payslips', icon: Wallet, roles: ['owner', 'manager', 'finance', 'foreman', 'worker'] },
    { id: 'sales',      label: 'Sales & CRM',         icon: Briefcase,  roles: ['owner', 'finance'] },
    { id: 'analytics',  label: 'Analytics & Reports',  icon: BarChart2,  roles: ['owner', 'finance'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3 mb-6">
          <Ship className="w-8 h-8" />
          <div>
            <div>Seabridge Boats</div>
            <div className="text-blue-300 text-sm">Manufacturing</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${
                  isActive 
                    ? 'bg-blue-800 text-white hover:bg-blue-700' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
                onClick={() => setCurrentView(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-blue-800">
        {user && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="text-sm">
                <div className="capitalize">{user.role}</div>
                <div className="text-blue-300 text-xs">{user.name}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-200 hover:text-white hover:bg-blue-800"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
