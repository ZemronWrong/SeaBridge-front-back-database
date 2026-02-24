import { Ship, LayoutDashboard, Package, ClipboardCheck, Wallet, User } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  userRole: string;
  setUserRole: (role: 'owner' | 'manager' | 'finance' | 'foreman' | 'worker') => void;
}

export function Sidebar({ currentView, setCurrentView, userRole, setUserRole }: SidebarProps) {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'finance', 'foreman', 'worker'] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: ['owner', 'manager', 'finance', 'foreman'] },
    { id: 'production', label: 'Production & QC', icon: ClipboardCheck, roles: ['owner', 'manager', 'foreman', 'worker'] },
    { id: 'payroll', label: 'Payroll', icon: Wallet, roles: ['owner', 'manager', 'finance', 'foreman', 'worker'] },
  ];

  // Filter menu items based on user role
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
        
        <div className="space-y-2">
          <label className="text-xs text-blue-300">User Role</label>
          <Select value={userRole} onValueChange={setUserRole}>
            <SelectTrigger className="bg-blue-800 border-blue-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="foreman">Foreman QC</SelectItem>
              <SelectItem value="worker">Skilled Worker</SelectItem>
            </SelectContent>
          </Select>
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <div className="capitalize">{userRole}</div>
            <div className="text-blue-300 text-xs">Alexander Cabahug Jr</div>
          </div>
        </div>
      </div>
    </div>
  );
}
