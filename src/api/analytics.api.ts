import { apiFetch } from './client';
import { AnalyticsData } from '../types/analytics';

export const analyticsApi = {
  getDashboard: () => apiFetch('/analytics/dashboard/') as Promise<AnalyticsData>,
};
