import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, DollarSign, Calendar, FileText, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../context/AuthContext';

interface PayrollModuleProps {}

interface Employee {
  id: string;
  name: string;
  position: string;
  dailyRate: number;
  type: 'Regular' | 'Contractual';
  teamId: string;
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  period: string;
  daysWorked: number;
  dailyRate: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: 'Pending' | 'Processed' | 'Paid';
  createdDate: string;
}

export function PayrollModule({}: PayrollModuleProps) {
  const { user } = useAuth();
  const userRole = user?.role ?? 'worker';
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const [employees] = useState<Employee[]>([
    { id: 'EMP-001', name: 'Juan dela Cruz', position: 'Senior Welder', dailyRate: 850, type: 'Regular', teamId: 'TEAM-A' },
    { id: 'EMP-002', name: 'Pedro Santos', position: 'Engine Technician', dailyRate: 900, type: 'Regular', teamId: 'TEAM-A' },
    { id: 'EMP-003', name: 'Maria Garcia', position: 'Carpenter', dailyRate: 750, type: 'Regular', teamId: 'TEAM-A' },
    { id: 'EMP-004', name: 'Jose Reyes', position: 'Interior Specialist', dailyRate: 800, type: 'Contractual', teamId: 'TEAM-A' },
    { id: 'EMP-005', name: 'Roberto Cruz', position: 'Painter', dailyRate: 700, type: 'Regular', teamId: 'TEAM-B' },
    { id: 'EMP-006', name: 'Ana Lopez', position: 'Electrician', dailyRate: 820, type: 'Regular', teamId: 'TEAM-B' },
    { id: 'EMP-007', name: 'Carlos Mendoza', position: 'Fiberglass Worker', dailyRate: 780, type: 'Contractual', teamId: 'TEAM-B' },
  ]);

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    { id: 'PAY-001', employeeId: 'EMP-001', employeeName: 'Juan dela Cruz', position: 'Senior Welder', period: '2025-10', daysWorked: 22, dailyRate: 850, grossPay: 18700, deductions: 1870, netPay: 16830, status: 'Paid', createdDate: '2025-10-31' },
    { id: 'PAY-002', employeeId: 'EMP-002', employeeName: 'Pedro Santos', position: 'Engine Technician', period: '2025-10', daysWorked: 22, dailyRate: 900, grossPay: 19800, deductions: 1980, netPay: 17820, status: 'Paid', createdDate: '2025-10-31' },
    { id: 'PAY-003', employeeId: 'EMP-003', employeeName: 'Maria Garcia', position: 'Carpenter', period: '2025-10', daysWorked: 20, dailyRate: 750, grossPay: 15000, deductions: 1500, netPay: 13500, status: 'Paid', createdDate: '2025-10-31' },
    { id: 'PAY-004', employeeId: 'EMP-001', employeeName: 'Juan dela Cruz', position: 'Senior Welder', period: '2025-11', daysWorked: 9, dailyRate: 850, grossPay: 7650, deductions: 765, netPay: 6885, status: 'Pending', createdDate: '2025-11-09' },
    { id: 'PAY-005', employeeId: 'EMP-002', employeeName: 'Pedro Santos', position: 'Engine Technician', period: '2025-11', daysWorked: 9, dailyRate: 900, grossPay: 8100, deductions: 810, netPay: 7290, status: 'Pending', createdDate: '2025-11-09' },
  ]);

  const [newPayroll, setNewPayroll] = useState({
    employeeId: '',
    period: '',
    daysWorked: 0
  });

  const handleCreatePayroll = () => {
    const employee = employees.find(e => e.id === newPayroll.employeeId);
    if (!employee) return;

    const grossPay = newPayroll.daysWorked * employee.dailyRate;
    const deductions = grossPay * 0.10; // 10% deduction example
    const netPay = grossPay - deductions;

    const newId = `PAY-${String(payrollRecords.length + 1).padStart(3, '0')}`;
    const record: PayrollRecord = {
      id: newId,
      employeeId: employee.id,
      employeeName: employee.name,
      position: employee.position,
      period: newPayroll.period,
      daysWorked: newPayroll.daysWorked,
      dailyRate: employee.dailyRate,
      grossPay,
      deductions,
      netPay,
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setPayrollRecords([...payrollRecords, record]);
    setIsPayrollDialogOpen(false);
    setNewPayroll({ employeeId: '', period: '', daysWorked: 0 });
    toast.success('Payroll record created');
  };

  // Role-based permissions
  const canManagePayroll = ['owner', 'finance'].includes(userRole);
  const isViewOnly = userRole === 'manager';
  const isEmployeeView = ['foreman', 'worker'].includes(userRole);
  
  const currentEmployeeId = isEmployeeView ? user?.employeeId ?? null : null;
  const currentTeamId = user?.teamId;
  const currentEmployee = isEmployeeView && currentEmployeeId ? employees.find(e => e.id === currentEmployeeId) : null;

  const roleFilteredRecords = payrollRecords.filter((r) => {
    if (userRole === 'owner' || userRole === 'finance') return true;
    if (userRole === 'manager') {
      if (!currentTeamId) return false;
      const employee = employees.find((e) => e.id === r.employeeId);
      return employee?.teamId === currentTeamId;
    }
    if (isEmployeeView && currentEmployeeId) {
      return r.employeeId === currentEmployeeId;
    }
    return false;
  });

  const filteredRecords = selectedPeriod === 'all' 
    ? roleFilteredRecords 
    : roleFilteredRecords.filter(r => r.period === selectedPeriod);

  const periods = ['all', ...Array.from(new Set(roleFilteredRecords.map(r => r.period)))];
  
  const totalGrossPay = filteredRecords.reduce((sum, r) => sum + r.grossPay, 0);
  const totalDeductions = filteredRecords.reduce((sum, r) => sum + r.deductions, 0);
  const totalNetPay = filteredRecords.reduce((sum, r) => sum + r.netPay, 0);
  const pendingPayments = payrollRecords.filter(r => r.status === 'Pending').length;

  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  const openPayslip = (record: PayrollRecord) => {
    setSelectedPayslip(record);
    setIsPayslipOpen(true);
  };

  const exportPayrollCsv = () => {
    const header = [
      'Payroll ID',
      'Employee ID',
      'Employee Name',
      'Position',
      'Period',
      'Days Worked',
      'Daily Rate',
      'Gross Pay',
      'Deductions',
      'Net Pay',
      'Status',
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.employeeId,
      r.employeeName,
      r.position,
      r.period,
      String(r.daysWorked),
      String(r.dailyRate),
      String(r.grossPay),
      String(r.deductions),
      String(r.netPay),
      r.status,
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'payroll-records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printPayslip = (record: PayrollRecord) => {
    const allowances = record.grossPay * 0.05;
    const totalDeductions = record.deductions;
    const netPay = record.netPay;

    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Payslip - ${record.employeeName}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 13px; }
            th { background: #f9fafb; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Seabridge Boats Manufacturing</h1>
          <p>Official Payslip</p>
          <h2>Employee Information</h2>
          <table>
            <tr><th>Employee</th><td>${record.employeeName}</td></tr>
            <tr><th>Position</th><td>${record.position}</td></tr>
            <tr><th>Period</th><td>${record.period}</td></tr>
            <tr><th>Payroll ID</th><td>${record.id}</td></tr>
          </table>
          <h2>Earnings</h2>
          <table>
            <tr><th>Description</th><th>Amount (PHP)</th></tr>
            <tr><td>Basic Pay (${record.daysWorked} days x ₱${record.dailyRate.toLocaleString()})</td><td>₱${record.grossPay.toLocaleString()}</td></tr>
            <tr><td>Allowances (5%)</td><td>₱${allowances.toLocaleString()}</td></tr>
          </table>
          <h2>Deductions</h2>
          <table>
            <tr><th>Description</th><th>Amount (PHP)</th></tr>
            <tr><td>Statutory & Other Deductions</td><td>₱${totalDeductions.toLocaleString()}</td></tr>
          </table>
          <h2>Net Pay</h2>
          <table>
            <tr><th>Net Pay</th><td>₱${netPay.toLocaleString()}</td></tr>
          </table>
          <p style="margin-top:24px;font-size:12px;color:#6b7280">
            Note: This payslip can be exported as PDF using the browser's "Print" &gt; "Save as PDF" option.
          </p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4 flex-col md:flex-row">
        <div>
          <h1>Payroll Management</h1>
          <p className="text-gray-600">
            {isEmployeeView ? 'View your payroll records' : 
             isViewOnly ? 'View employee payroll records' : 
             'Manage employee payroll records'}
          </p>
        </div>
        {canManagePayroll && (
          <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Payroll Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select 
                    value={newPayroll.employeeId}
                    onValueChange={(v) => setNewPayroll({...newPayroll, employeeId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.position} (₱{emp.dailyRate}/day)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pay Period (YYYY-MM)</Label>
                  <Input 
                    type="month"
                    value={newPayroll.period}
                    onChange={(e) => setNewPayroll({...newPayroll, period: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Days Worked</Label>
                  <Input 
                    type="number"
                    value={newPayroll.daysWorked}
                    onChange={(e) => setNewPayroll({...newPayroll, daysWorked: Number(e.target.value)})}
                    placeholder="Number of days worked"
                  />
                </div>
                {newPayroll.employeeId && newPayroll.daysWorked > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Daily Rate:</span>
                      <span>₱{employees.find(e => e.id === newPayroll.employeeId)?.dailyRate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gross Pay:</span>
                      <span>₱{((employees.find(e => e.id === newPayroll.employeeId)?.dailyRate || 0) * newPayroll.daysWorked).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deductions (10%):</span>
                      <span>₱{(((employees.find(e => e.id === newPayroll.employeeId)?.dailyRate || 0) * newPayroll.daysWorked) * 0.10).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Net Pay:</span>
                      <span>₱{(((employees.find(e => e.id === newPayroll.employeeId)?.dailyRate || 0) * newPayroll.daysWorked) * 0.90).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsPayrollDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePayroll}>Create Payroll</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      {isEmployeeView && currentEmployee && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg">Employee Information</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p>{currentEmployee.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p>{currentEmployee.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Daily Rate</p>
                    <p>₱{currentEmployee.dailyRate.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p>{currentEmployee.type}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isEmployeeView && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl mt-2">{employees.length}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600">Total Gross Pay</p>
                <p className="text-2xl mt-2">₱{totalGrossPay.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600">Total Net Pay</p>
                <p className="text-2xl mt-2">₱{totalNetPay.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl mt-2">{pendingPayments}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Filter by Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period} value={period}>
                      {period === 'all' ? 'All Periods' : period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees List - only for non-employee views */}
      {!isEmployeeView && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>₱{employee.dailyRate.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={employee.type === 'Regular' ? 'default' : 'secondary'}>
                        {employee.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payroll Records */}
      <Card>
        <CardHeader>
          <CardTitle>{isEmployeeView ? 'My Payroll Records' : 'Payroll Records'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-2 flex-col md:flex-row">
            <p className="text-xs text-gray-500">
              Export the current view to Excel/CSV or generate a PDF payslip per employee record.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={exportPayrollCsv}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Payroll (Excel/CSV)
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payroll ID</TableHead>
                {!isEmployeeView && <TableHead>Employee</TableHead>}
                {!isEmployeeView && <TableHead>Position</TableHead>}
                <TableHead>Period</TableHead>
                <TableHead>Days Worked</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payslip</TableHead>
                {canManagePayroll && <TableHead>Update Status</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.id}</TableCell>
                  {!isEmployeeView && <TableCell>{record.employeeName}</TableCell>}
                  {!isEmployeeView && <TableCell className="text-sm">{record.position}</TableCell>}
                  <TableCell>{record.period}</TableCell>
                  <TableCell>{record.daysWorked}</TableCell>
                  <TableCell>₱{record.grossPay.toLocaleString()}</TableCell>
                  <TableCell>₱{record.deductions.toLocaleString()}</TableCell>
                  <TableCell>₱{record.netPay.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        record.status === 'Paid' ? 'default' : 
                        record.status === 'Processed' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => openPayslip(record)}
                    >
                      <FileText className="w-3 h-3" />
                      View Payslip
                    </Button>
                  </TableCell>
                  {canManagePayroll && (
                    <TableCell>
                      {record.status !== 'Paid' && (
                        <Select
                          value={record.status}
                          onValueChange={(v) => {
                            setPayrollRecords(payrollRecords.map(r => 
                              r.id === record.id ? {...r, status: v as PayrollRecord['status']} : r
                            ));
                            toast.success('Payroll status updated');
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processed">Processed</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isPayslipOpen} onOpenChange={setIsPayslipOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Employee</p>
                <p className="font-medium">{selectedPayslip.employeeName}</p>
                <p className="text-xs text-gray-500">{selectedPayslip.position}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Payroll ID</p>
                  <p>{selectedPayslip.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Period</p>
                  <p>{selectedPayslip.period}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Days Worked</p>
                  <p>{selectedPayslip.daysWorked}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Daily Rate</p>
                  <p>₱{selectedPayslip.dailyRate.toLocaleString()}</p>
                </div>
              </div>
              <div className="border rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Basic Pay</span>
                  <span>₱{selectedPayslip.grossPay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowances (5%)</span>
                  <span>₱{(selectedPayslip.grossPay * 0.05).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Deductions</span>
                  <span>₱{selectedPayslip.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-1">
                  <span>Net Pay</span>
                  <span>₱{selectedPayslip.netPay.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPayslipOpen(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => selectedPayslip && printPayslip(selectedPayslip)}
                >
                  <Download className="w-4 h-4" />
                  Download / Print Payslip (PDF)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
