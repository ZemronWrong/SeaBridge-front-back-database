export type DTRStatus = 'Present' | 'Absent' | 'On Leave';

export interface DTRRecord {
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
