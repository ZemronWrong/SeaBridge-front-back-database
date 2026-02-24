import { useState } from 'react';
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
import { toast } from 'sonner@2.0.3';

interface ProductionModuleProps {
  userRole: string;
}

interface Task {
  id: string;
  projectId: string;
  projectName: string;
  taskName: string;
  assignedTo: string;
  assignedBy: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  deadline: string;
  createdDate: string;
  description: string;
}

interface QualityCheck {
  id: string;
  projectId: string;
  projectName: string;
  inspectionItem: string;
  inspector: string;
  result: 'Pass' | 'Fail';
  notes: string;
  date: string;
}

export function ProductionModule({ userRole }: ProductionModuleProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isQCDialogOpen, setIsQCDialogOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 'TSK-001', projectId: 'PRJ-001', projectName: 'Coast Guard Patrol Boat', taskName: 'Hull Welding', assignedTo: 'Juan dela Cruz', assignedBy: 'Manager', status: 'In Progress', deadline: '2025-11-12', createdDate: '2025-11-05', description: 'Complete welding of main hull sections' },
    { id: 'TSK-002', projectId: 'PRJ-001', projectName: 'Coast Guard Patrol Boat', taskName: 'Engine Installation', assignedTo: 'Pedro Santos', assignedBy: 'Manager', status: 'Pending', deadline: '2025-11-15', createdDate: '2025-11-06', description: 'Install and test Yamaha 250HP engine' },
    { id: 'TSK-003', projectId: 'PRJ-002', projectName: 'Municipal Fishing Vessel', taskName: 'Deck Construction', assignedTo: 'Maria Garcia', assignedBy: 'Manager', status: 'In Progress', deadline: '2025-11-10', createdDate: '2025-11-04', description: 'Build and install deck structure' },
    { id: 'TSK-004', projectId: 'PRJ-003', projectName: 'Private Yacht Customization', taskName: 'Interior Finishing', assignedTo: 'Jose Reyes', assignedBy: 'Manager', status: 'Completed', deadline: '2025-11-08', createdDate: '2025-11-01', description: 'Complete interior woodwork and upholstery' },
    { id: 'TSK-005', projectId: 'PRJ-003', projectName: 'Private Yacht Customization', taskName: 'Final Paint Job', assignedTo: 'Roberto Cruz', assignedBy: 'Manager', status: 'In Progress', deadline: '2025-11-11', createdDate: '2025-11-07', description: 'Apply final coat of marine paint' },
  ]);

  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([
    { id: 'QC-001', projectId: 'PRJ-003', projectName: 'Private Yacht Customization', inspectionItem: 'Hull Integrity', inspector: 'Foreman QC', result: 'Pass', notes: 'All welds inspected. No defects found.', date: '2025-11-08' },
    { id: 'QC-002', projectId: 'PRJ-001', projectName: 'Coast Guard Patrol Boat', inspectionItem: 'Engine Mount', inspector: 'Foreman QC', result: 'Pass', notes: 'Mounting bolts properly torqued.', date: '2025-11-07' },
    { id: 'QC-003', projectId: 'PRJ-002', projectName: 'Municipal Fishing Vessel', inspectionItem: 'Deck Coating', inspector: 'Foreman QC', result: 'Fail', notes: 'Uneven coating in stern area. Requires rework.', date: '2025-11-06' },
    { id: 'QC-004', projectId: 'PRJ-001', projectName: 'Coast Guard Patrol Boat', inspectionItem: 'Electrical System', inspector: 'Foreman QC', result: 'Pass', notes: 'All connections tested. Systems operational.', date: '2025-11-05' },
    { id: 'QC-005', projectId: 'PRJ-003', projectName: 'Private Yacht Customization', inspectionItem: 'Fuel System', inspector: 'Foreman QC', result: 'Pass', notes: 'Pressure test completed successfully.', date: '2025-11-04' },
  ]);

  const [newTask, setNewTask] = useState({
    projectId: '',
    projectName: '',
    taskName: '',
    assignedTo: '',
    deadline: '',
    description: ''
  });

  const [newQC, setNewQC] = useState({
    projectId: '',
    projectName: '',
    inspectionItem: '',
    result: 'Pass' as 'Pass' | 'Fail',
    notes: ''
  });

  const workers = ['Juan dela Cruz', 'Pedro Santos', 'Maria Garcia', 'Jose Reyes', 'Roberto Cruz', 'Ana Lopez', 'Carlos Mendoza'];
  const projects = ['PRJ-001 - Coast Guard Patrol Boat', 'PRJ-002 - Municipal Fishing Vessel', 'PRJ-003 - Private Yacht Customization', 'PRJ-004 - BFAR Monitoring Boat'];

  const handleAddTask = () => {
    const newId = `TSK-${String(tasks.length + 1).padStart(3, '0')}`;
    const task: Task = {
      id: newId,
      ...newTask,
      assignedBy: userRole.charAt(0).toUpperCase() + userRole.slice(1),
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, task]);
    setIsTaskDialogOpen(false);
    setNewTask({ projectId: '', projectName: '', taskName: '', assignedTo: '', deadline: '', description: '' });
    toast.success('Task assigned successfully');
  };

  const handleAddQC = () => {
    const newId = `QC-${String(qualityChecks.length + 1).padStart(3, '0')}`;
    const qc: QualityCheck = {
      id: newId,
      ...newQC,
      inspector: userRole.charAt(0).toUpperCase() + userRole.slice(1),
      date: new Date().toISOString().split('T')[0]
    };
    setQualityChecks([...qualityChecks, qc]);
    setIsQCDialogOpen(false);
    setNewQC({ projectId: '', projectName: '', inspectionItem: '', result: 'Pass', notes: '' });
    toast.success('Quality check recorded');
  };

  // Role-based permissions
  const canAssignTasks = ['owner', 'manager'].includes(userRole);
  const canPerformQC = ['owner', 'foreman'].includes(userRole);
  const canViewQC = ['owner', 'manager', 'foreman'].includes(userRole);
  const isWorker = userRole === 'worker';
  const currentUser = userRole === 'worker' ? 'Juan dela Cruz' : null; // Mock current user for workers

  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const passRate = qualityChecks.length > 0 
    ? Math.round((qualityChecks.filter(q => q.result === 'Pass').length / qualityChecks.length) * 100)
    : 0;

  // Filter tasks for workers to show only their assigned tasks
  const visibleTasks = isWorker && currentUser 
    ? tasks.filter(t => t.assignedTo === currentUser)
    : tasks;

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
                        value={newTask.projectId}
                        onValueChange={(v) => {
                          const [id, ...name] = v.split(' - ');
                          setNewTask({...newTask, projectId: id, projectName: name.join(' - ')});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Task Name</Label>
                      <Input 
                        value={newTask.taskName}
                        onChange={(e) => setNewTask({...newTask, taskName: e.target.value})}
                        placeholder="e.g., Hull Welding"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select 
                        value={newTask.assignedTo}
                        onValueChange={(v) => setNewTask({...newTask, assignedTo: v})}
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
                      <TableCell>{task.id}</TableCell>
                      <TableCell className="text-sm">{task.projectName}</TableCell>
                      <TableCell>{task.taskName}</TableCell>
                      {!isWorker && <TableCell>{task.assignedTo}</TableCell>}
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
                      {!isWorker && <TableCell className="text-sm">{task.assignedBy}</TableCell>}
                      <TableCell>
                        {task.status !== 'Completed' && (isWorker || canAssignTasks || canPerformQC) && (
                          <Select
                            value={task.status}
                            onValueChange={(v) => {
                              setTasks(tasks.map(t => 
                                t.id === task.id ? {...t, status: v as Task['status']} : t
                              ));
                              toast.success('Task status updated');
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
                        value={newQC.projectId}
                        onValueChange={(v) => {
                          const [id, ...name] = v.split(' - ');
                          setNewQC({...newQC, projectId: id, projectName: name.join(' - ')});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Inspection Item</Label>
                      <Input 
                        value={newQC.inspectionItem}
                        onChange={(e) => setNewQC({...newQC, inspectionItem: e.target.value})}
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
                      <TableCell>{qc.id}</TableCell>
                      <TableCell className="text-sm">{qc.projectName}</TableCell>
                      <TableCell>{qc.inspectionItem}</TableCell>
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
