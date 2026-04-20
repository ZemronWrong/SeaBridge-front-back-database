import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { analyticsApi } from '../api/analytics.api';
import { AnalyticsData } from '../types/analytics';

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await analyticsApi.getDashboard();
      setData(response);
    } catch (e: any) {
      toast.error('Failed to load analytics: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refreshData: fetchData };
}
