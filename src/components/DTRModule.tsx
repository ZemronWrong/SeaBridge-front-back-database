import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Calendar, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

type DTRStatus = 'Present' | 'Absent' | 'On Leave';

interface DTRRecord {
  id: number;
  dtr_id: string;
  employee: number;
  employee_name: string;
  team_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  break_minutes: number;
  overtime_hours: string | number;
  status: DTRStatus;
}

export function DTRModule() {
  const { user } = useAuth();
  const [records, setRecords] = useState<DTRRecord[]>([]);
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Use local date for "today"
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

  const isEmployee = user?.role === 'worker' || user?.role === 'foreman';

  const fetchDTR = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/dtr/');
      setRecords(data);
    } catch (e: any) {
      toast.error('Failed to load DTR: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDTR();
  }, []);

  // Filter records based on selected period logic (frontend)
  const filteredByPeriod = records.filter((r) => {
    if (dateFilter) {
      return r.date === dateFilter;
    }
    if (periodFilter === 'today') return r.date === today;
    
    if (periodFilter === 'week') {
       const recDate = new Date(r.date);
       const now = new Date();
       const diffTime = Math.abs(now.getTime() - recDate.getTime());
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
       return diffDays <= 7;
    }
    if (periodFilter === 'month') {
       return r.date.substring(0, 7) === today.substring(0, 7);
    }
    return true; // all
  });

  const handleClockIn = async () => {
    try {
      const resp = await apiFetch('/dtr/clock-in/', {
        method: 'POST',
        body: JSON.stringify({ time_in: new Date().toLocaleTimeString([], { hour12: false }) })
      });
      setRecords((prev) => [...prev, resp]);
      toast.success('Clocked in successfully');
    } catch(e: any) {
      toast.error('Clock-in failed: ' + e.message);
    }
  };

  const handleClockOut = async () => {
    try {
      const resp = await apiFetch('/dtr/clock-out/', {
        method: 'POST',
        body: JSON.stringify({ 
           time_out: new Date().toLocaleTimeString([], { hour12: false }),
           break_minutes: 60, // Default break
           overtime_hours: 0  // Default overtime (needs manual adjustment normally)
        })
      });
      setRecords((prev) => prev.map(r => r.id === resp.id ? resp : r));
      toast.success('Clocked out successfully');
    } catch(e: any) {
      toast.error('Clock-out failed: ' + e.message);
    }
  };

  const exportToCsv = () => {
    const header = [
      'DTR ID',
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
      r.dtr_id,
      r.employee_name,
      r.team_id,
      r.date,
      r.time_in || '-',
      r.time_out || '-',
      String(r.break_minutes),
      String(r.overtime_hours),
      r.status,
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\\n');
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-gray-500 h-24">
                    Loading records...
                  </TableCell>
                </TableRow>
              ) : filteredByPeriod.length > 0 ? (
                filteredByPeriod.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{rec.date}</TableCell>
                    {!isEmployee && <TableCell>{rec.employee_name}</TableCell>}
                    {!isEmployee && <TableCell>{rec.team_id}</TableCell>}
                    <TableCell>{rec.time_in || '-'}</TableCell>
                    <TableCell>{rec.time_out || '-'}</TableCell>
                    <TableCell>{rec.break_minutes}</TableCell>
                    <TableCell>{rec.overtime_hours}</TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-gray-500 h-24">
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

