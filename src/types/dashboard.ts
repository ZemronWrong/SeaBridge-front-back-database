import { Material } from './inventory';
import { Project } from './project';
import { QualityCheck } from './production';

export interface DashboardMetrics {
  totalMaterials: number;
  activeProjects: number;
  activeWorkers: number;
  monthlyPayroll: number;
  lowStockItems: Material[];
  projects: Project[];
  qualityChecks: QualityCheck[];
}
