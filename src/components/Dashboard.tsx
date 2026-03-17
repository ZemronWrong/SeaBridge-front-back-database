import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Package, Users, ClipboardCheck, DollarSign, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const userRole = user?.role ?? 'worker';
  const stats = [
    { 
      title: 'Total Materials', 
      value: '156', 
      icon: Package, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Active Projects', 
      value: '8', 
      icon: ClipboardCheck, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Active Workers', 
      value: '24', 
      icon: Users, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'Monthly Payroll', 
      value: '₱485,600', 
      icon: DollarSign, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
  ];

  const lowStockItems = [
    { name: 'Marine Plywood 4x8', current: 12, minimum: 20, unit: 'sheets' },
    { name: 'Epoxy Resin', current: 15, minimum: 25, unit: 'liters' },
    { name: 'Fiberglass Cloth', current: 8, minimum: 15, unit: 'rolls' },
    { name: 'Stainless Steel Bolts', current: 45, minimum: 100, unit: 'pcs' },
  ];

  const activeProjects = [
    { id: 'PRJ-001', name: 'Coast Guard Patrol Boat', progress: 65, status: 'On Track', deadline: '2025-11-25' },
    { id: 'PRJ-002', name: 'Municipal Fishing Vessel', progress: 40, status: 'On Track', deadline: '2025-12-10' },
    { id: 'PRJ-003', name: 'Private Yacht Customization', progress: 85, status: 'Nearly Complete', deadline: '2025-11-15' },
    { id: 'PRJ-004', name: 'BFAR Monitoring Boat', progress: 25, status: 'Started', deadline: '2026-01-20' },
  ];

  const recentQualityChecks = [
    { project: 'PRJ-003', item: 'Hull Integrity', result: 'Pass', date: '2025-11-08' },
    { project: 'PRJ-001', item: 'Engine Mount', result: 'Pass', date: '2025-11-07' },
    { project: 'PRJ-002', item: 'Deck Coating', result: 'Fail', date: '2025-11-06' },
    { project: 'PRJ-001', item: 'Electrical System', result: 'Pass', date: '2025-11-05' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1>Welcome, {user?.name ?? 'User'}</h1>
        <p className="text-gray-600">
          {userRole === 'owner' && 'Executive overview of production, DTR, and payroll.'}
          {userRole === 'manager' && 'Team-level view of attendance, overtime, and project progress.'}
          {userRole === 'finance' && 'Payroll and payslip analytics across all employees.'}
          {['foreman', 'worker'].includes(userRole) && 'Personal and team insights for daily operations.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.current} / {item.minimum} {item.unit}</p>
                    </div>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                  <Progress value={(item.current / item.minimum) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm">{project.name}</p>
                      <p className="text-xs text-gray-600">{project.id} • Due: {project.deadline}</p>
                    </div>
                    <span className="text-xs">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quality Checks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quality Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentQualityChecks.map((check, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm">{check.item}</p>
                    <p className="text-xs text-gray-600">{check.project} • {check.date}</p>
                  </div>
                  <Badge variant={check.result === 'Pass' ? 'default' : 'destructive'}>
                    {check.result}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-sm">Add Material Delivery</div>
                <div className="text-xs text-gray-600">Record new inventory arrival</div>
              </button>
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-sm">Assign New Task</div>
                <div className="text-xs text-gray-600">Create worker assignment</div>
              </button>
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-sm">Perform QC Inspection</div>
                <div className="text-xs text-gray-600">Log quality check results</div>
              </button>
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-sm">Open DTR & Attendance</div>
                <div className="text-xs text-gray-600">Review daily time records and overtime</div>
              </button>
              <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-sm">Generate Payroll</div>
                <div className="text-xs text-gray-600">Create payroll and payslips for current period</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Simple DTR summary for defense explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Attendance Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Present Today</p>
                <p className="text-2xl font-semibold">21</p>
              </div>
              <div>
                <p className="text-gray-500">On Overtime</p>
                <p className="text-2xl font-semibold">4</p>
              </div>
              <div>
                <p className="text-gray-500">On Leave</p>
                <p className="text-2xl font-semibold">2</p>
              </div>
              <div>
                <p className="text-gray-500">Absent</p>
                <p className="text-2xl font-semibold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
