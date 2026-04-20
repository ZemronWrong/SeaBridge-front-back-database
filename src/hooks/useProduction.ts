import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { productionApi } from '../api/production.api';
import { Task, QualityCheck } from '../types/production';
import { Project } from '../types/project';

export function useProduction() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes, qcRes] = await Promise.all([
        productionApi.getProjects(),
        productionApi.getTasks(),
        productionApi.getQualityChecks()
      ]);
      setProjects(projRes || []);
      setTasks(taskRes || []);
      setQualityChecks(qcRes || []);
    } catch (e: any) {
      toast.error('Failed to load production data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (payload: any) => {
    try {
      const saved = await productionApi.createTask(payload);
      setTasks([...tasks, saved]);
      toast.success('Task created successfully');
      return true;
    } catch (e: any) {
      toast.error('Failed to assign task: ' + e.message);
      return false;
    }
  };

  const updateTaskStatus = async (id: number, status: string) => {
    try {
      const updated = await productionApi.updateTaskStatus(id, status);
      setTasks(tasks.map(t => t.id === id ? updated : t));
      toast.success(`Task marked as ${status}`);
      return true;
    } catch (e: any) {
      toast.error('Failed to update task: ' + e.message);
      return false;
    }
  };

  const createQC = async (payload: any) => {
    try {
      const saved = await productionApi.createQualityCheck(payload);
      setQualityChecks([...qualityChecks, saved]);
      toast.success('Quality check recorded');
      return true;
    } catch (e: any) {
      toast.error('Failed to record QC: ' + e.message);
      return false;
    }
  };

  return {
    tasks,
    projects,
    qualityChecks,
    loading,
    createTask,
    updateTaskStatus,
    createQC,
    refreshData: fetchData
  };
}
