import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Calendar, Clock, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useDTR } from '../hooks/useDTR';

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
  auto_clocked_out?: boolean;
  requires_adjustment?: boolean;
}

export function DTRModule() {
  const { user } = useAuth();
  const { records, loading, handleClockIn, handleClockOut, handleApproveAdjustment } = useDTR();
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const today = new Date().toLocaleDateString('en-CA');
  const isEmployee = user?.role === 'worker' || user?.role === 'foreman';
  const canApprove = user?.role === 'owner' || user?.role === 'manager';

  // Filter records based on selected period logic (frontend)
  const filteredByPeriod = records.filter((r) => {
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
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
          <div className="flex flex-col md:flex-row gap-4 items-center w-full">
            <div className="flex flex-wrap flex-1 w-full bg-white border border-gray-200 rounded-md p-1 px-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all items-center gap-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search name or ID..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm min-w-[120px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="border-l border-gray-200 h-6 mx-2 hidden md:block"></div>
              
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 md:border-none">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:inline">Preset:</span>
                <Select value={periodFilter} onValueChange={(v: any) => setPeriodFilter(v)}>
                  <SelectTrigger className="h-8 border-none bg-transparent shadow-none w-[110px] focus:ring-0 px-1">
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
              
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:inline">After:</span>
                <input 
                  type="date" 
                  className="bg-transparent border-none focus:outline-none text-sm text-gray-700 cursor-pointer w-[120px]"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:inline">Before:</span>
                <input 
                  type="date" 
                  className="bg-transparent border-none focus:outline-none text-sm text-gray-700 cursor-pointer w-[120px]"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-end justify-center">
              <p className="text-xs text-gray-500 whitespace-nowrap">
                Exported reports match current filters.
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
                {canApprove && <TableHead>Action</TableHead>}
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
                filteredByPeriod
                  .filter(r => !searchTerm || r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) || r.dtr_id.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{rec.date}</TableCell>
                    {!isEmployee && <TableCell>{rec.employee_name}</TableCell>}
                    {!isEmployee && <TableCell>{rec.team_id}</TableCell>}
                    <TableCell>{rec.time_in || '-'}</TableCell>
                    <TableCell>{rec.time_out || '-'}</TableCell>
                    <TableCell>{rec.break_minutes}</TableCell>
                    <TableCell>{rec.overtime_hours}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 items-center">
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
                        {rec.auto_clocked_out && (
                          <Badge className="bg-amber-500 text-xs">Auto</Badge>
                        )}
                        {rec.requires_adjustment && (
                          <Badge variant="destructive" className="text-xs">Needs Review</Badge>
                        )}
                      </div>
                    </TableCell>
                    {canApprove && (
                      <TableCell>
                        {rec.requires_adjustment ? (
                          <Button size="sm" variant="outline" onClick={() => handleApproveAdjustment(rec.id)}>
                            Approve
                          </Button>
                        ) : null}
                      </TableCell>
                    )}
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

