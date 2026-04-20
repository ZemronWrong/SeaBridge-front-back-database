import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { dtrApi } from '../api/dtr.api';
import { DTRRecord } from '../types/dtr';

export function useDTR() {
  const [records, setRecords] = useState<DTRRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDTR();
  }, []);

  const fetchDTR = async () => {
    setLoading(true);
    try {
      const data = await dtrApi.getRecords();
      setRecords(data || []);
    } catch (e: any) {
      toast.error('Failed to load DTR: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      const saved = await dtrApi.clockIn();
      setRecords([saved, ...records]);
      toast.success('Clocked in successfully');
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  };

  const handleClockOut = async () => {
    try {
      const saved = await dtrApi.clockOut();
      setRecords(records.map(r => r.id === saved.id ? saved : r));
      toast.success('Clocked out successfully');
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  };

  const handleApproveAdjustment = async (id: number) => {
    try {
      const updated = await dtrApi.approveAdjustment(id);
      setRecords(records.map(r => r.id === id ? updated : r));
      toast.success('Adjustment approved');
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  };

  return {
    records,
    loading,
    handleClockIn,
    handleClockOut,
    handleApproveAdjustment,
    refreshDTR: fetchDTR
  };
}
