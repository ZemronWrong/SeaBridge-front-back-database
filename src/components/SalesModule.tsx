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
import { Plus, Users, FileText, Search, CreditCard, Ship, Building2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  preferences: string;
}

interface Project {
  id: number;
  project_id: string;
  name: string;
  customer?: number | null;
  customer_name?: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  customer: number;
  customer_name: string;
  project?: number | null;
  project_name?: string;
  project_code?: string;
  amount_due: string | number;
  status: string;
  issued_date: string;
  due_date: string;
  notes: string;
}

export function SalesModule() {
  const { user } = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: '', company: '', email: '', phone: '', address: '', preferences: ''
  });

  const [newInvoice, setNewInvoice] = useState({
    invoice_number: `INV-${Math.floor(Math.random() * 10000)}`,
    customer: '', project: '', amount_due: 0, due_date: '', notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, invRes, projRes] = await Promise.all([
        apiFetch('/customers/'),
        apiFetch('/invoices/'),
        apiFetch('/projects/')
      ]);
      setCustomers(custRes);
      setInvoices(invRes);
      setProjects(projRes);
    } catch (e: any) {
      toast.error('Failed to load CRM data: ' + e.message);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) {
      toast.error("Name is required");
      return;
    }
    try {
      const saved = await apiFetch('/customers/', {
        method: 'POST',
        body: JSON.stringify(newCustomer)
      });
      setCustomers([saved, ...customers]);
      setIsCustomerDialogOpen(false);
      setNewCustomer({ name: '', company: '', email: '', phone: '', address: '', preferences: '' });
      toast.success('Customer created successfully');
    } catch (e: any) {
      toast.error('Failed to create customer: ' + e.message);
    }
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.customer || !newInvoice.amount_due || !newInvoice.due_date) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const payload = {
        ...newInvoice,
        customer: Number(newInvoice.customer),
        project: newInvoice.project ? Number(newInvoice.project) : null,
      };
      const saved = await apiFetch('/invoices/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setInvoices([saved, ...invoices]);
      setIsInvoiceDialogOpen(false);
      setNewInvoice({ invoice_number: `INV-${Math.floor(Math.random() * 10000)}`, customer: '', project: '', amount_due: 0, due_date: '', notes: '' });
      toast.success('Invoice generated successfully');
    } catch (e: any) {
      toast.error('Failed to generate invoice: ' + e.message);
    }
  };

  const handleUpdateInvoiceStatus = async (id: number, status: string) => {
    try {
      const updated = await apiFetch(`/invoices/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setInvoices(invoices.map(inv => inv.id === id ? updated : inv));
      toast.success(`Invoice updated to ${status}`);
    } catch (e: any) {
      toast.error('Failed to update: ' + e.message);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Draft': return <Badge className="bg-gray-500">Draft</Badge>;
      case 'Sent': return <Badge className="bg-blue-500">Sent</Badge>;
      case 'Paid': return <Badge className="bg-green-600">Paid</Badge>;
      case 'Overdue': return <Badge variant="destructive">Overdue</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Tabs defaultValue="customers" className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="flex items-center gap-2"><Briefcase className="w-6 h-6 text-blue-800" /> Sales & CRM</h1>
          <p className="text-gray-600">Manage clients, boat orders, and billing.</p>
        </div>
        <TabsList>
          <TabsTrigger value="customers"><Users className="w-4 h-4 mr-2"/> Client Directory</TabsTrigger>
          <TabsTrigger value="invoices"><FileText className="w-4 h-4 mr-2"/> Invoicing</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="customers" className="space-y-6">
        <div className="flex gap-4 items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search clients..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Client Profile</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Company (Optional)</Label><Input value={newCustomer.company} onChange={e => setNewCustomer({...newCustomer, company: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Address</Label><Input value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} /></div>
                <div className="space-y-2"><Label>Preferences / Notes</Label><Textarea value={newCustomer.preferences} onChange={e => setNewCustomer({...newCustomer, preferences: e.target.value})} /></div>
                <Button className="w-full" onClick={handleCreateCustomer}>Save Profile</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(cust => (
            <Card key={cust.id} className="hover:shadow-md transition-shadow cursor-default">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{cust.name}</h3>
                    {cust.company && <p className="text-sm text-gray-500 flex items-center gap-1"><Building2 className="w-3 h-3"/> {cust.company}</p>}
                  </div>
                  <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold">
                    {cust.name.substring(0,2).toUpperCase()}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Email:</strong> {cust.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {cust.phone || 'N/A'}</p>
                  <p><strong>Active Boats:</strong> {projects.filter(p => p.customer === cust.id).length}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredCustomers.length === 0 && <p className="col-span-full text-center text-gray-500 py-8">No clients found.</p>}
        </div>
      </TabsContent>

      <TabsContent value="invoices" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5"/> Billing Records</h2>
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button><FileText className="w-4 h-4 mr-2" /> Generate Invoice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Invoice (Flat Pricing)</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Invoice #</Label>
                  <Input value={newInvoice.invoice_number} onChange={e => setNewInvoice({...newInvoice, invoice_number: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Bill To (Client)</Label>
                  <Select value={newInvoice.customer} onValueChange={v => setNewInvoice({...newInvoice, customer: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>For Project (Optional)</Label>
                  <Select value={newInvoice.project} onValueChange={v => setNewInvoice({...newInvoice, project: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Boat Project" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- None --</SelectItem>
                      {projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.project_id} - {p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount Due (₱)</Label>
                    <Input type="number" min="0" value={newInvoice.amount_due} onChange={e => setNewInvoice({...newInvoice, amount_due: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Due By</Label>
                    <Input type="date" value={newInvoice.due_date} onChange={e => setNewInvoice({...newInvoice, due_date: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes / Payment Terms</Label>
                  <Textarea placeholder="e.g. 50% downpayment" value={newInvoice.notes} onChange={e => setNewInvoice({...newInvoice, notes: e.target.value})} />
                </div>
                <Button className="w-full" onClick={handleCreateInvoice}>Issue Invoice</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium text-blue-600">{inv.invoice_number}</TableCell>
                    <TableCell>{new Date(inv.issued_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">{inv.customer_name}</TableCell>
                    <TableCell>
                      {inv.project_code ? (
                        <span className="flex items-center gap-1 text-sm text-gray-600"><Ship className="w-3 h-3"/> {inv.project_code}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="font-bold">₱{Number(inv.amount_due).toLocaleString()}</TableCell>
                    <TableCell>{inv.due_date}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell>
                      <Select value={inv.status} onValueChange={v => handleUpdateInvoiceStatus(inv.id, v)}>
                        <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Sent">Sent</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-6 text-gray-500">No invoices generated yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
