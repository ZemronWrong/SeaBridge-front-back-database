import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, ClipboardCheck, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../api';

interface ProductionModuleProps {
  userRole: string;
}

interface Project {
  id: number;
  project_id: string;
  name: string;
}

interface Task {
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
}

interface QualityCheck {
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

export function ProductionModule({ userRole }: ProductionModuleProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isQCDialogOpen, setIsQCDialogOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);

  const [newTask, setNewTask] = useState({
    project: '', 
    task_name: '',
    assigned_to: '',
    deadline: '',
    description: ''
  });

  const [newQC, setNewQC] = useState({
    project: '',
    inspection_item: '',
    result: 'Pass' as 'Pass' | 'Fail',
    notes: ''
  });

  const workers = ['Juan dela Cruz', 'Pedro Santos', 'Maria Garcia', 'Jose Reyes', 'Roberto Cruz', 'Ana Lopez', 'Carlos Mendoza'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projData, taskData, qcData] = await Promise.all([
        apiFetch('/projects/'),
        apiFetch('/tasks/'),
        apiFetch('/quality-checks/').catch(() => []) // Workers might get 403 or empty, we handle it
      ]);
      setProjects(projData);
      setTasks(taskData);
      setQualityChecks(qcData);
    } catch (e: any) {
      toast.error('Failed to load production data: ' + e.message);
    }
  };

  const handleAddTask = async () => {
    try {
      const payload = {
        project: Number(newTask.project),
        task_name: newTask.task_name,
        assigned_to: newTask.assigned_to,
        deadline: newTask.deadline,
        description: newTask.description
      };
      const savedTask = await apiFetch('/tasks/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setTasks([...tasks, savedTask]);
      setIsTaskDialogOpen(false);
      setNewTask({ project: '', task_name: '', assigned_to: '', deadline: '', description: '' });
      toast.success('Task assigned successfully');
    } catch(e: any) {
      toast.error('Failed to assign task: ' + e.message);
    }
  };

  const handleAddQC = async () => {
    try {
      const payload = {
        project: Number(newQC.project),
        inspection_item: newQC.inspection_item,
        result: newQC.result,
        notes: newQC.notes
      };
      const savedQC = await apiFetch('/quality-checks/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setQualityChecks([...qualityChecks, savedQC]);
      setIsQCDialogOpen(false);
      setNewQC({ project: '', inspection_item: '', result: 'Pass', notes: '' });
      toast.success('Quality check recorded');
    } catch (e: any) {
      toast.error('Failed to save quality check: ' + e.message);
    }
  };

  // Role-based permissions
  const canAssignTasks = ['owner', 'manager'].includes(userRole);
  const canPerformQC = ['owner', 'foreman'].includes(userRole);
  const canViewQC = ['owner', 'manager', 'foreman'].includes(userRole);
  const isWorker = userRole === 'worker';

  const pendingTasks = tasks.filter((t: Task) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t: Task) => t.status === 'In Progress').length;
  const completedTasks = tasks.filter((t: Task) => t.status === 'Completed').length;
  const passRate = qualityChecks.length > 0 
    ? Math.round((qualityChecks.filter((q: QualityCheck) => q.result === 'Pass').length / qualityChecks.length) * 100)
    : 0;

  // With API, tasks are already filtered for workers!
  const visibleTasks = tasks;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1>Production & Quality Control</h1>
          <p className="text-gray-600">Manage tasks and quality inspections</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-2xl mt-2">{pendingTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl mt-2">{inProgressTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl mt-2">{completedTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600">QC Pass Rate</p>
              <p className="text-2xl mt-2">{passRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-end">
            {canAssignTasks && (
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Assign New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select 
                        value={newTask.project}
                        onValueChange={(v) => setNewTask({...newTask, project: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>{`${p.project_id} - ${p.name}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Task Name</Label>
                      <Input 
                        value={newTask.task_name}
                        onChange={(e) => setNewTask({...newTask, task_name: e.target.value})}
                        placeholder="e.g., Hull Welding"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select 
                        value={newTask.assigned_to}
                        onValueChange={(v) => setNewTask({...newTask, assigned_to: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select worker" />
                        </SelectTrigger>
                        <SelectContent>
                          {workers.map(w => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Deadline</Label>
                      <Input 
                        type="date"
                        value={newTask.deadline}
                        onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        placeholder="Task details and instructions"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddTask}>Assign Task</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isWorker ? 'My Assigned Tasks' : 'Assigned Tasks'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Task Name</TableHead>
                    {!isWorker && <TableHead>Assigned To</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    {!isWorker && <TableHead>Assigned By</TableHead>}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.task_id}</TableCell>
                      <TableCell className="text-sm">{task.project_name}</TableCell>
                      <TableCell>{task.task_name}</TableCell>
                      {!isWorker && <TableCell>{task.assigned_to}</TableCell>}
                      <TableCell>
                        <Badge 
                          variant={
                            task.status === 'Completed' ? 'default' : 
                            task.status === 'In Progress' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{task.deadline}</TableCell>
                      {!isWorker && <TableCell className="text-sm">{task.assigned_by}</TableCell>}
                      <TableCell>
                        {task.status !== 'Completed' && (isWorker || canAssignTasks || canPerformQC) && (
                          <Select
                            value={task.status}
                            onValueChange={async (v) => {
                              try {
                                await apiFetch(`/tasks/${task.id}/update-status/`, {
                                  method: 'POST',
                                  body: JSON.stringify({ status: v })
                                });
                                setTasks(tasks.map(t => 
                                  t.id === task.id ? {...t, status: v as Task['status']} : t
                                ));
                                toast.success('Task status updated');
                              } catch(e: any) {
                                toast.error('Failed to update: ' + e.message);
                              }
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {canViewQC && (
          <TabsContent value="quality" className="space-y-6">
          <div className="flex justify-end">
            {canPerformQC && (
              <Dialog open={isQCDialogOpen} onOpenChange={setIsQCDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    New Quality Check
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Perform Quality Check</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select 
                        value={newQC.project}
                        onValueChange={(v) => setNewQC({...newQC, project: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>{`${p.project_id} - ${p.name}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Inspection Item</Label>
                      <Input 
                        value={newQC.inspection_item}
                        onChange={(e) => setNewQC({...newQC, inspection_item: e.target.value})}
                        placeholder="e.g., Hull Integrity, Engine Mount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Result</Label>
                      <Select 
                        value={newQC.result}
                        onValueChange={(v: 'Pass' | 'Fail') => setNewQC({...newQC, result: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pass">Pass</SelectItem>
                          <SelectItem value="Fail">Fail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea 
                        value={newQC.notes}
                        onChange={(e) => setNewQC({...newQC, notes: e.target.value})}
                        placeholder="Inspection notes and observations"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsQCDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddQC}>Submit QC Report</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quality Check History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QC ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Inspection Item</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityChecks.map((qc) => (
                    <TableRow key={qc.id}>
                      <TableCell>{qc.qc_id}</TableCell>
                      <TableCell className="text-sm">{qc.project_name}</TableCell>
                      <TableCell>{qc.inspection_item}</TableCell>
                      <TableCell>{qc.inspector}</TableCell>
                      <TableCell>
                        <Badge variant={qc.result === 'Pass' ? 'default' : 'destructive'}>
                          {qc.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{qc.date}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{qc.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
