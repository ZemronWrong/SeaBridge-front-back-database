import { apiFetch } from './client';
import { DTRRecord } from '../types/dtr';

export const dtrApi = {
  getRecords: () => apiFetch('/dtr/') as Promise<DTRRecord[]>,
  
  clockIn: () => apiFetch('/dtr/clock-in/', {
    method: 'POST',
    body: JSON.stringify({ time_in: new Date().toLocaleTimeString([], { hour12: false }) })
  }) as Promise<DTRRecord>,
  
  clockOut: () => apiFetch('/dtr/clock-out/', {
    method: 'POST',
    body: JSON.stringify({ 
      time_out: new Date().toLocaleTimeString([], { hour12: false }),
      break_minutes: 60, // Default break
      overtime_hours: 0  // Default overtime
    })
  }) as Promise<DTRRecord>,
  
  approveAdjustment: (id: number, note: string = 'Approved by manager') => apiFetch(`/dtr/${id}/approve-adjustment/`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }) as Promise<DTRRecord>,
};
