import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, DollarSign, Calendar, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

interface PayrollModuleProps {}

interface Employee {
  id: number;
  employee_id: string;
  first_name?: string;
  last_name?: string;
  name: string;
  position: string;
  daily_rate: string | number;
  employment_type: 'Regular' | 'Contractual';
  team_id: string;
}

interface PayrollRecord {
  id: number;
  payroll_id: string;
  employee: number;
  employee_name: string;
  position: string;
  period: string;
  days_worked: number;
  daily_rate: string | number;
  gross_pay: string | number;
  deductions: string | number;
  net_pay: string | number;
  status: 'Pending' | 'Processed' | 'Paid';
  created_date: string;
}

export function PayrollModule({}: PayrollModuleProps) {
  const { user } = useAuth();
  const userRole = user?.role ?? 'worker';
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);

  const [newPayroll, setNewPayroll] = useState({
    employeeId: '',
    period: '',
    days_worked: 0
  });

  useEffect(() => {
    fetchData();
  }, [userRole]);

  const fetchData = async () => {
    try {
      const pData = await apiFetch('/payroll/');
      setPayrollRecords(pData);
      
      if (['owner', 'manager', 'finance'].includes(userRole)) {
        const eData = await apiFetch('/employees/');
        setEmployees(eData);
      }
    } catch(e: any) {
      toast.error('Failed to load payroll data: ' + e.message);
    }
  };

  const handleCreatePayroll = async () => {
    if (!newPayroll.employeeId) {
      toast.error('Please select an employee.');
      return;
    }
    if (!newPayroll.period) {
      toast.error('Please enter a pay period.');
      return;
    }
    if (newPayroll.days_worked <= 0) {
      toast.error('Days worked must be greater than 0.');
      return;
    }

    try {
      const payload = {
        employee_id: newPayroll.employeeId,
        period: newPayroll.period,
        days_worked: newPayroll.days_worked
      };
      
      const savedRecord = await apiFetch('/payroll/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setPayrollRecords([...payrollRecords, savedRecord]);
      setIsPayrollDialogOpen(false);
      setNewPayroll({ employeeId: '', period: '', days_worked: 0 });
      toast.success('Payroll record created');
    } catch (e: any) {
      toast.error('Failed to create payroll: ' + e.message);
    }
  };

  // Role-based permissions
  const canManagePayroll = ['owner', 'finance'].includes(userRole);
  const isViewOnly = userRole === 'manager';
  const isEmployeeView = ['foreman', 'worker'].includes(userRole);
  
  const currentEmployeeId = isEmployeeView ? (user as any)?.employee_id ?? null : null;
  const currentTeamId = (user as any)?.team_id;
  
  // Try to derive employee details from payroll records if the user is a worker
  let currentEmployee: Employee | null | undefined = null;
  if (isEmployeeView && currentEmployeeId) {
    currentEmployee = employees.find((e: Employee) => e.employee_id === currentEmployeeId);
    if (!currentEmployee && payrollRecords.length > 0) {
      const r = payrollRecords[0];
      currentEmployee = {
        id: r.employee,
        employee_id: currentEmployeeId,
        name: r.employee_name,
        position: r.position,
        daily_rate: r.daily_rate,
        employment_type: 'Regular', // placeholder
        team_id: currentTeamId
      };
    }
  }

  // API filters automatically for employees based on backend role logic, but frontend might still apply filters based on state 
  // Let's rely primarily on backend filtering for security, the API only returns what is allowed.
  
  const roleFilteredRecords = Array.isArray(payrollRecords) ? payrollRecords : [];

  const filteredRecords = selectedPeriod === 'all' 
    ? roleFilteredRecords 
    : roleFilteredRecords.filter((r: PayrollRecord) => r.period === selectedPeriod);

  const periods = ['all', ...Array.from(new Set(roleFilteredRecords.map((r: PayrollRecord) => r.period)))];
  
  const totalGrossPay = filteredRecords.reduce((sum: number, r: PayrollRecord) => sum + Number(r.gross_pay || 0), 0);
  const totalDeductions = filteredRecords.reduce((sum: number, r: PayrollRecord) => sum + Number(r.deductions || 0), 0);
  const totalNetPay = filteredRecords.reduce((sum: number, r: PayrollRecord) => sum + Number(r.net_pay || 0), 0);
  const pendingPayments = roleFilteredRecords.filter((r: PayrollRecord) => r.status === 'Pending').length;

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
    const rows = filteredRecords.map((r: PayrollRecord) => [
      r.payroll_id,
      String(r.employee),
      r.employee_name,
      r.position,
      r.period,
      String(r.days_worked),
      String(r.daily_rate),
      String(r.gross_pay),
      String(r.deductions),
      String(r.net_pay),
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
    const gross = Number(record.gross_pay);
    const allowances = gross * 0.05;
    const totalDeductions = Number(record.deductions);
    const netPay = Number(record.net_pay);

    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Payslip - ${record.employee_name}</title>
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
            <tr><th>Employee</th><td>${record.employee_name}</td></tr>
            <tr><th>Position</th><td>${record.position}</td></tr>
            <tr><th>Period</th><td>${record.period}</td></tr>
            <tr><th>Payroll ID</th><td>${record.payroll_id}</td></tr>
          </table>
          <h2>Earnings</h2>
          <table>
            <tr><th>Description</th><th>Amount (PHP)</th></tr>
            <tr><td>Basic Pay (${record.days_worked} days x ₱${Number(record.daily_rate).toLocaleString()})</td><td>₱${gross.toLocaleString()}</td></tr>
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
                    onValueChange={(v: string) => setNewPayroll({...newPayroll, employeeId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.employee_id}>
                          {emp.name} - {emp.position} (₱{emp.daily_rate}/day)
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
                    value={newPayroll.days_worked}
                    onChange={(e) => setNewPayroll({...newPayroll, days_worked: Number(e.target.value)})}
                    placeholder="Number of days worked"
                  />
                </div>
                {newPayroll.employeeId && newPayroll.days_worked > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Daily Rate:</span>
                      <span>₱{Number(employees.find(e => e.employee_id === newPayroll.employeeId)?.daily_rate || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gross Pay:</span>
                      <span>₱{(Number(employees.find(e => e.employee_id === newPayroll.employeeId)?.daily_rate || 0) * newPayroll.days_worked).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deductions (10%):</span>
                      <span>₱{((Number(employees.find(e => e.employee_id === newPayroll.employeeId)?.daily_rate || 0) * newPayroll.days_worked) * 0.10).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Net Pay:</span>
                      <span>₱{((Number(employees.find(e => e.employee_id === newPayroll.employeeId)?.daily_rate || 0) * newPayroll.days_worked) * 0.90).toLocaleString()}</span>
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
                    <p>₱{Number(currentEmployee.daily_rate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p>{currentEmployee.employment_type}</p>
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
                    <TableCell>{employee.employee_id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>₱{Number(employee.daily_rate).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={employee.employment_type === 'Regular' ? 'default' : 'secondary'}>
                        {employee.employment_type}
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
                  <TableCell>{record.payroll_id}</TableCell>
                  {!isEmployeeView && <TableCell>{record.employee_name}</TableCell>}
                  {!isEmployeeView && <TableCell className="text-sm">{record.position}</TableCell>}
                  <TableCell>{record.period}</TableCell>
                  <TableCell>{record.days_worked}</TableCell>
                  <TableCell>₱{Number(record.gross_pay).toLocaleString()}</TableCell>
                  <TableCell>₱{Number(record.deductions).toLocaleString()}</TableCell>
                  <TableCell>₱{Number(record.net_pay).toLocaleString()}</TableCell>
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
                          onValueChange={async (v: string) => {
                            try {
                              await apiFetch(`/payroll/${record.id}/update-status/`, {
                                method: 'POST',
                                body: JSON.stringify({ status: v })
                              });
                              setPayrollRecords(payrollRecords.map(r => 
                                r.id === record.id ? {...r, status: v as PayrollRecord['status']} : r
                              ));
                              toast.success('Payroll status updated');
                            } catch(e: any) {
                              toast.error('Failed to update: ' + e.message);
                            }
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
                <p className="font-medium">{selectedPayslip.employee_name}</p>
                <p className="text-xs text-gray-500">{selectedPayslip.position}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Payroll ID</p>
                  <p>{selectedPayslip.payroll_id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Period</p>
                  <p>{selectedPayslip.period}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Days Worked</p>
                  <p>{selectedPayslip.days_worked}</p>
                </div>
                <div className="flex justify-between">
                  <span>Daily Rate</span>
                  <span>₱{Number(selectedPayslip.daily_rate || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="border rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Gross Pay</span>
                  <span>₱{Number(selectedPayslip.gross_pay || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Deductions (10%)</span>
                  <span>₱{Number(selectedPayslip.deductions || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-1">
                  <span>Net Pay</span>
                  <span>₱{Number(selectedPayslip.net_pay || 0).toLocaleString()}</span>
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
