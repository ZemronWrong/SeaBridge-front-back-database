import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Calendar, Clock, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type DTRStatus = 'Present' | 'Absent' | 'On Leave';

interface DTRRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  teamId: string;
  date: string;
  timeIn: string;
  timeOut: string;
  breakMinutes: number;
  overtimeHours: number;
  status: DTRStatus;
}

const initialDtrRecords: DTRRecord[] = [
  {
    id: 'DTR-001',
    employeeId: 'EMP-001',
    employeeName: 'Juan dela Cruz',
    teamId: 'TEAM-A',
    date: '2025-11-07',
    timeIn: '08:00',
    timeOut: '17:30',
    breakMinutes: 60,
    overtimeHours: 1.5,
    status: 'Present',
  },
  {
    id: 'DTR-002',
    employeeId: 'EMP-002',
    employeeName: 'Pedro Santos',
    teamId: 'TEAM-A',
    date: '2025-11-07',
    timeIn: '08:15',
    timeOut: '17:00',
    breakMinutes: 60,
    overtimeHours: 0,
    status: 'Present',
  },
  {
    id: 'DTR-003',
    employeeId: 'EMP-003',
    employeeName: 'Maria Garcia',
    teamId: 'TEAM-A',
    date: '2025-11-07',
    timeIn: '08:05',
    timeOut: '16:30',
    breakMinutes: 45,
    overtimeHours: 0,
    status: 'Present',
  },
  {
    id: 'DTR-004',
    employeeId: 'EMP-004',
    employeeName: 'Jose Reyes',
    teamId: 'TEAM-A',
    date: '2025-11-07',
    timeIn: '-',
    timeOut: '-',
    breakMinutes: 0,
    overtimeHours: 0,
    status: 'On Leave',
  },
];

export function DTRModule() {
  const { user } = useAuth();
  const [records, setRecords] = useState<DTRRecord[]>(initialDtrRecords);
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [dateFilter, setDateFilter] = useState('');

  const today = '2025-11-07';

  const canApproveOvertime = user?.role === 'manager' || user?.role === 'owner';
  const isEmployee = user?.role === 'worker' || user?.role === 'foreman';

  const currentEmployeeId = isEmployee ? user?.employeeId : undefined;
  const currentTeamId = user?.teamId;

  const filteredByRole = records.filter((r) => {
    if (user?.role === 'owner' || user?.role === 'finance') return true;
    if (user?.role === 'manager') {
      if (!currentTeamId) return false;
      return r.teamId === currentTeamId;
    }
    if (isEmployee && currentEmployeeId) {
      return r.employeeId === currentEmployeeId;
    }
    return false;
  });

  const filteredByPeriod = filteredByRole.filter((r) => {
    if (dateFilter) {
      return r.date === dateFilter;
    }
    if (periodFilter === 'today') return r.date === today;
    if (periodFilter === 'week') return true;
    if (periodFilter === 'month') return true;
    return true;
  });

  const handleClockIn = () => {
    if (!currentEmployeeId || !user) return;

    const existing = records.find((r) => r.date === today && r.employeeId === currentEmployeeId);
    if (existing) return;

    const newRecord: DTRRecord = {
      id: `DTR-${String(records.length + 1).padStart(3, '0')}`,
      employeeId: currentEmployeeId,
      employeeName: user.name,
      teamId: currentTeamId ?? 'TEAM-A',
      date: today,
      timeIn: '08:00',
      timeOut: '-',
      breakMinutes: 0,
      overtimeHours: 0,
      status: 'Present',
    };

    setRecords((prev) => [...prev, newRecord]);
  };

  const handleClockOut = () => {
    if (!currentEmployeeId) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.date === today && r.employeeId === currentEmployeeId
          ? { ...r, timeOut: '17:00', overtimeHours: 0.5 }
          : r
      )
    );
  };

  const exportToCsv = () => {
    const header = [
      'DTR ID',
      'Employee ID',
      'Employee Name',
      'Team',
      'Date',
      'Time In',
      'Time Out',
      'Break (mins)',
      'Overtime (hrs)',
      'Status',
    ];
    const rows = filteredByPeriod.map((r) => [
      r.id,
      r.employeeId,
      r.employeeName,
      r.teamId,
      r.date,
      r.timeIn,
      r.timeOut,
      String(r.breakMinutes),
      String(r.overtimeHours),
      r.status,
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dtr-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>{isEmployee ? 'My Daily Time Record' : 'DTR & Attendance'}</h1>
          <p className="text-gray-600 text-sm">
            {isEmployee
              ? 'Track your attendance, breaks, and overtime with a personal DTR view.'
              : user?.role === 'manager'
              ? 'Monitor and approve team attendance, overtime, and DTR reports.'
              : 'Company-wide overview of attendance patterns and DTR records.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEmployee && (
            <>
              <Button size="sm" onClick={handleClockIn} className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Clock In
              </Button>
              <Button size="sm" variant="outline" onClick={handleClockOut} className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Clock Out
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={exportToCsv}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export DTR (Excel/CSV)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            DTR Filters & Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Period</p>
              <Select value={periodFilter} onValueChange={(v: any) => setPeriodFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Records</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Specific Date</p>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <p className="text-xs text-gray-500">
                Exported reports can be opened in Excel and saved as PDF for submission.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isEmployee ? 'My DTR Records' : 'DTR Records'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {!isEmployee && <TableHead>Employee</TableHead>}
                {!isEmployee && <TableHead>Team</TableHead>}
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Break (mins)</TableHead>
                <TableHead>Overtime (hrs)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredByPeriod.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell>{rec.date}</TableCell>
                  {!isEmployee && <TableCell>{rec.employeeName}</TableCell>}
                  {!isEmployee && <TableCell>{rec.teamId}</TableCell>}
                  <TableCell>{rec.timeIn}</TableCell>
                  <TableCell>{rec.timeOut}</TableCell>
                  <TableCell>{rec.breakMinutes}</TableCell>
                  <TableCell>{rec.overtimeHours}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        rec.status === 'Present'
                          ? 'default'
                          : rec.status === 'On Leave'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {rec.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredByPeriod.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-gray-500">
                    No DTR records found for the selected filters and role.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

