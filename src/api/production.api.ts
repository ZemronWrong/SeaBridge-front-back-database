import { apiFetch } from './client';
import { Task, QualityCheck } from '../types/production';
import { Project } from '../types/project';

export const productionApi = {
  getProjects: () => apiFetch('/projects/') as Promise<Project[]>,
  
  getTasks: () => apiFetch('/tasks/') as Promise<Task[]>,
  
  createTask: (payload: any) => apiFetch('/tasks/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as Promise<Task>,
  
  updateTaskStatus: (id: number, status: string) => apiFetch(`/tasks/${id}/update-status/`, {
    method: 'POST',
    body: JSON.stringify({ status })
  }) as Promise<Task>,

  getQualityChecks: () => apiFetch('/quality-checks/') as Promise<QualityCheck[]>,
  
  createQualityCheck: (payload: any) => apiFetch('/quality-checks/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as Promise<QualityCheck>,
};
