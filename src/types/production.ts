export interface Task {
  id: number;
  task_id: string;
  project: number;
  project_name: string;
  task_name: string;
  assigned_to: string;
  assigned_by: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  deadline: string;
  created_date: string;
  description: string;
  deadline_flag?: string;
  missed_deadline_count?: number;
}

export interface QualityCheck {
  id: number;
  qc_id: string;
  project: number;
  project_name: string;
  inspection_item: string;
  inspector: string;
  result: 'Pass' | 'Fail';
  notes: string;
  date: string;
}
