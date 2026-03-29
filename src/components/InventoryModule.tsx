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
import { Plus, Search, AlertTriangle, Package, Edit, ClipboardList, Truck, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

interface Material {
  id: number;
  material_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  unit_price: string | number;
  supplier: string | number;
  supplier_name?: string;
  last_updated: string;
  total_value?: string | number;
  stock_status?: string;
}

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

interface Project {
  id: number;
  project_id: string;
  name: string;
}

interface MaterialRequest {
  id: number;
  material: number;
  material_name: string;
  quantity: number;
  project: number;
  project_name: string;
  requester: number;
  requester_name: string;
  status: string;
  required_date: string;
  notes: string;
  created_at: string;
}

interface PurchaseOrderItem {
  material: number;
  material_name?: string;
  quantity: number;
  unit_price: number | string;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier: number;
  supplier_name: string;
  created_by: number;
  created_by_name: string;
  status: string;
  expected_delivery: string;
  total_cost: number | string;
  created_at: string;
  items: PurchaseOrderItem[];
}

export function InventoryModule() {
  const { user } = useAuth();
  const userRole = user?.role || 'worker';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  
  const [isPODialogOpen, setIsPODialogOpen] = useState(false);

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    min_stock: 0,
    unit_price: 0,
    supplier: '' as string | number
  });

  const [updateStock, setUpdateStock] = useState({
    quantity: 0,
    operation: 'add'
  });

  const [newRequest, setNewRequest] = useState({
    material: '',
    quantity: 1,
    project: '',
    required_date: '',
    notes: ''
  });

  const [newPO, setNewPO] = useState({
    supplier: '',
    expected_delivery: '',
    items: [{ material: '', quantity: 1, unit_price: 0 }] as any[]
  });

  useEffect(() => {
    fetchMaterials();
    fetchSuppliers();
    fetchRequests();
    fetchProjects();
    fetchPurchaseOrders();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await apiFetch('/materials/');
      setMaterials(data);
    } catch (error: any) {
      toast.error('Failed to load materials: ' + error.message);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await apiFetch('/suppliers/');
      setSuppliers(data);
    } catch (error: any) {
      toast.error('Failed to load suppliers: ' + error.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await apiFetch('/material-requests/');
      setRequests(data);
    } catch (error: any) {
      toast.error('Failed to load requests: ' + error.message);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiFetch('/projects/');
      setProjects(data);
    } catch (error: any) {
      toast.error('Failed to load projects: ' + error.message);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const data = await apiFetch('/purchase-orders/');
      setPurchaseOrders(data);
    } catch (error: any) {
      toast.error('Failed to load POs: ' + error.message);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.material_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(materials.map(m => m.category)))];

  const handleAddMaterial = async () => {
    try {
      const payload = {
        ...newMaterial,
        material_id: `MAT-${String(materials.length + 1).padStart(3, '0')}`
      };
      
      const savedMaterial = await apiFetch('/materials/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setMaterials([...materials, savedMaterial]);
      setIsAddDialogOpen(false);
      setNewMaterial({ name: '', category: '', quantity: 0, unit: '', min_stock: 0, unit_price: 0, supplier: '' });
      toast.success('Material added successfully');
    } catch (e: any) {
      toast.error('Failed to add material: ' + e.message);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedMaterial) return;
    if (updateStock.quantity < 1) {
      toast.error('Quantity must be greater than or equal to 1.');
      return;
    }
    try {
      const updatedMaterial = await apiFetch(`/materials/${selectedMaterial.id}/update-stock/`, {
        method: 'POST',
        body: JSON.stringify({
          quantity: updateStock.quantity,
          operation: updateStock.operation
        })
      });
      setMaterials(materials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
      setIsUpdateDialogOpen(false);
      setUpdateStock({ quantity: 0, operation: 'add' });
      toast.success('Stock updated successfully');
    } catch(e: any) {
      toast.error('Failed to update stock: ' + e.message);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.material || !newRequest.quantity || !newRequest.project || !newRequest.required_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const saved = await apiFetch('/material-requests/', {
        method: 'POST',
        body: JSON.stringify(newRequest)
      });
      setRequests([saved, ...requests]);
      setIsRequestDialogOpen(false);
      setNewRequest({ material: '', quantity: 1, project: '', required_date: '', notes: '' });
      toast.success('Material request submitted');
    } catch (e: any) {
      toast.error('Failed to submit request: ' + e.message);
    }
  };

  const handleUpdateRequestStatus = async (id: number, newStatus: string) => {
    try {
      const updated = await apiFetch(`/material-requests/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setRequests(requests.map(r => r.id === updated.id ? updated : r));
      
      // If fulfilled, we know stock decreased on backend, so we refresh materials
      if (newStatus === 'Fulfilled') {
        fetchMaterials();
      }
      toast.success(`Request marked as ${newStatus}`);
    } catch(e: any) {
      toast.error('Failed to update status: ' + e.message);
    }
  };

  const handleCreatePO = async () => {
    if (!newPO.supplier || newPO.items.length === 0) {
      toast.error('Supplier and at least one item are required');
      return;
    }
    
    // Ensure data types are valid for backend
    const payload = {
      supplier: Number(newPO.supplier),
      expected_delivery: newPO.expected_delivery || null,
      items: newPO.items.map(i => ({
        material: Number(i.material),
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price)
      }))
    };

    try {
      const saved = await apiFetch('/purchase-orders/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setPurchaseOrders([saved, ...purchaseOrders]);
      setIsPODialogOpen(false);
      setNewPO({ supplier: '', expected_delivery: '', items: [{ material: '', quantity: 1, unit_price: 0 }] });
      toast.success('Purchase Order created');
    } catch (e: any) {
      toast.error('Failed to create PO: ' + e.message);
    }
  };

  const handleUpdatePOStatus = async (id: number, newStatus: string) => {
    try {
      const updated = await apiFetch(`/purchase-orders/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setPurchaseOrders(purchaseOrders.map(po => po.id === updated.id ? updated : po));
      
      // If Received, materials increase on backend
      if (newStatus === 'Received') {
        fetchMaterials();
      }
      toast.success(`PO marked as ${newStatus}`);
    } catch(e: any) {
      toast.error('Failed to update PO status: ' + e.message);
    }
  };

  const getStockStatus = (material: Material) => {
    const status = material.stock_status || (material.quantity <= material.min_stock ? 'Low Stock' : 'Good');
    if (status === 'Low Stock') {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (status === 'Warning') {
      return <Badge className="bg-orange-500">Warning</Badge>;
    }
    return <Badge className="bg-green-600">Good</Badge>;
  };

  const getRequestStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending': return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'Approved': return <Badge className="bg-blue-500">Approved</Badge>;
      case 'Ordered': return <Badge className="bg-purple-500">Ordered</Badge>;
      case 'Fulfilled': return <Badge className="bg-green-600">Fulfilled</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  }

  const getPOStatusBadge = (status: string) => {
    switch(status) {
      case 'Draft': return <Badge className="bg-gray-500">Draft</Badge>;
      case 'Sent': return <Badge className="bg-blue-500">Sent</Badge>;
      case 'Received': return <Badge className="bg-green-600">Received</Badge>;
      case 'Cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  }

  const lowStockCount = Array.isArray(materials) ? materials.filter(m => m.quantity <= (m.min_stock || 0)).length : 0;
  const totalValue = Array.isArray(materials) ? materials.reduce((sum, m) => sum + ((m.quantity || 0) * Number(m.unit_price || 0)), 0) : 0;

  // Role-based permissions
  const canAddMaterial = ['owner', 'finance'].includes(userRole);
  const canUpdateStock = ['owner', 'finance', 'foreman'].includes(userRole);
  const canCreateRequest = ['owner', 'finance', 'foreman'].includes(userRole);
  const canApproveRequest = ['owner', 'finance'].includes(userRole);
  const isViewOnly = userRole === 'manager';

  return (
    <Tabs defaultValue="stock" className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-gray-600">
            {isViewOnly ? 'View material stock levels' : 'Track and manage material stock levels and requests'}
          </p>
        </div>
        <TabsList>
          <TabsTrigger value="stock"><Package className="w-4 h-4 mr-2"/> Stock List</TabsTrigger>
          <TabsTrigger value="requests"><ClipboardList className="w-4 h-4 mr-2"/> Requests</TabsTrigger>
          {canAddMaterial && <TabsTrigger value="purchase-orders"><ShoppingCart className="w-4 h-4 mr-2"/> POs</TabsTrigger>}
          {canAddMaterial && <TabsTrigger value="suppliers"><Truck className="w-4 h-4 mr-2"/> Suppliers</TabsTrigger>}
        </TabsList>
      </div>

      <TabsContent value="stock" className="space-y-6">
        {/* Controls */}
        <div className="flex justify-end">
        {canAddMaterial && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material Name</Label>
                  <Input 
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                    placeholder="e.g., Marine Plywood"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                    placeholder="e.g., Wood"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Initial Quantity</Label>
                  <Input 
                    type="number"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input 
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                    placeholder="e.g., sheets, liters"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Stock Level</Label>
                  <Input 
                    type="number"
                    value={newMaterial.min_stock}
                    onChange={(e) => setNewMaterial({...newMaterial, min_stock: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price (₱)</Label>
                  <Input 
                    type="number"
                    value={newMaterial.unit_price}
                    onChange={(e) => setNewMaterial({...newMaterial, unit_price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select 
                    value={newMaterial.supplier.toString()} 
                    onValueChange={(v: string) => setNewMaterial({...newMaterial, supplier: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddMaterial}>Add Material</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Materials</p>
                  <p className="text-2xl mt-2">{materials.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl mt-2">{lowStockCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600">Total Inventory Value</p>
                <p className="text-2xl mt-2">₱{totalValue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search materials..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Materials Table */}
        <Card>
          <CardHeader>
            <CardTitle>Material Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Last Updated</TableHead>
                  {canUpdateStock && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>{material.material_id}</TableCell>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.category}</TableCell>
                    <TableCell>{material.quantity || 0} {material.unit}</TableCell>
                    <TableCell>{material.min_stock || 0} {material.unit}</TableCell>
                    <TableCell>{getStockStatus(material)}</TableCell>
                    <TableCell>₱{Number(material.unit_price || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-blue-600">{material.supplier_name || 'No Supplier'}</TableCell>
                    <TableCell>₱{((material.quantity || 0) * Number(material.unit_price || 0)).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{material.last_updated ? material.last_updated.substring(0, 10) : '-'}</TableCell>
                    {canUpdateStock && (
                      <TableCell className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedMaterial(material);
                            setIsUpdateDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Update
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => {
                            setNewRequest({
                              ...newRequest,
                              material: material.id.toString()
                            });
                            setIsRequestDialogOpen(true);
                          }}
                        >
                          <ClipboardList className="w-3 h-3 mr-1" />
                          Request
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="requests" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Material Requests</h2>
          {canCreateRequest && (
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> New Request</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Request Materials</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Material</Label>
                    <Select value={newRequest.material} onValueChange={(v: string) => setNewRequest({...newRequest, material: v})}>
                      <SelectTrigger><SelectValue placeholder="Select Material" /></SelectTrigger>
                      <SelectContent>
                        {materials.map(m => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.name} (Stock: {m.quantity} {m.unit})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Project / Job Costing</Label>
                    <Select value={newRequest.project} onValueChange={(v: string) => setNewRequest({...newRequest, project: v})}>
                      <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.project_id} - {p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity Needed</Label>
                    <Input type="number" min="1" value={newRequest.quantity} onChange={(e) => setNewRequest({...newRequest, quantity: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Required By (Date)</Label>
                    <Input type="date" value={newRequest.required_date} onChange={(e) => setNewRequest({...newRequest, required_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Reason for request..." value={newRequest.notes} onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})} />
                  </div>
                  <Button className="w-full" onClick={handleCreateRequest}>Submit Request</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Required By</TableHead>
                  <TableHead>Status</TableHead>
                  {canApproveRequest && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-4">No material requests found.</TableCell></TableRow>
                ) : requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{req.requester_name}</TableCell>
                    <TableCell>{req.project_name}</TableCell>
                    <TableCell>{req.material_name}</TableCell>
                    <TableCell>{req.quantity}</TableCell>
                    <TableCell>{req.required_date}</TableCell>
                    <TableCell>{getRequestStatusBadge(req.status)}</TableCell>
                    {canApproveRequest && (
                      <TableCell>
                        <Select value={req.status} onValueChange={(v: string) => handleUpdateRequestStatus(req.id, v)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Ordered">Ordered</SelectItem>
                            <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {canAddMaterial && (
        <TabsContent value="purchase-orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Purchase Orders</h2>
            <Dialog open={isPODialogOpen} onOpenChange={setIsPODialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Build PO</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Supplier</Label>
                      <Select value={newPO.supplier} onValueChange={(v: string) => setNewPO({...newPO, supplier: v})}>
                        <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                        <SelectContent>
                          {suppliers.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Delivery Date</Label>
                      <Input type="date" value={newPO.expected_delivery} onChange={(e) => setNewPO({...newPO, expected_delivery: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold mt-4 block">Order Items</Label>
                    {newPO.items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-end border p-4 rounded-lg bg-gray-50">
                        <div className="space-y-2 flex-1">
                          <Label>Material</Label>
                          <Select 
                            value={item.material} 
                            onValueChange={(v: string) => {
                              const newItems = [...newPO.items];
                              newItems[index].material = v;
                              // Auto-fill price if we know it
                              const mat = materials.find(m => m.id.toString() === v);
                              if (mat) newItems[index].unit_price = mat.unit_price;
                              setNewPO({...newPO, items: newItems});
                            }}
                          >
                            <SelectTrigger><SelectValue placeholder="Select Material" /></SelectTrigger>
                            <SelectContent>
                              {materials.map(m => (
                                <SelectItem key={m.id} value={m.id.toString()}>{m.name} ({m.material_id})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 w-24">
                          <Label>Qty</Label>
                          <Input type="number" min="1" value={item.quantity} onChange={(e) => {
                            const newItems = [...newPO.items];
                            newItems[index].quantity = Number(e.target.value);
                            setNewPO({...newPO, items: newItems});
                          }} />
                        </div>
                        <div className="space-y-2 w-32">
                          <Label>Unit Price</Label>
                          <Input type="number" value={item.unit_price} onChange={(e) => {
                            const newItems = [...newPO.items];
                            newItems[index].unit_price = Number(e.target.value);
                            setNewPO({...newPO, items: newItems});
                          }} />
                        </div>
                        <Button 
                          variant="destructive" 
                          className="mb-0"
                          onClick={() => {
                            const newItems = newPO.items.filter((_, i) => i !== index);
                            setNewPO({...newPO, items: newItems});
                          }}
                        >
                          X
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={() => setNewPO({...newPO, items: [...newPO.items, { material: '', quantity: 1, unit_price: 0 }]})}
                      className="w-full mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Material
                    </Button>
                  </div>

                  <Button className="w-full" onClick={handleCreatePO}>Create Purchase Order</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-4">No purchase orders found.</TableCell></TableRow>
                  ) : purchaseOrders.map(po => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium text-blue-600">{po.po_number}</TableCell>
                      <TableCell>{new Date(po.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{po.supplier_name}</TableCell>
                      <TableCell>{po.items?.length || 0} type(s)</TableCell>
                      <TableCell>{po.expected_delivery || '-'}</TableCell>
                      <TableCell>₱{Number(po.total_cost || 0).toLocaleString()}</TableCell>
                      <TableCell>{getPOStatusBadge(po.status)}</TableCell>
                      <TableCell>
                        <Select value={po.status} onValueChange={(v: string) => handleUpdatePOStatus(po.id, v)}>
                          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Sent">Sent</SelectItem>
                            <SelectItem value="Received">Received</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {canAddMaterial && (
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Supplier Directory</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center">No suppliers listed.</TableCell></TableRow>
                  ) : suppliers.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.contact_person}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{s.address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {/* Update Stock Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock: {selectedMaterial?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Current Stock</p>
              <p className="text-2xl">{selectedMaterial?.quantity} {selectedMaterial?.unit}</p>
            </div>
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select value={updateStock.operation} onValueChange={(v: string) => setUpdateStock({...updateStock, operation: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock (Delivery)</SelectItem>
                  <SelectItem value="subtract">Subtract Stock (Usage)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number"
                value={updateStock.quantity}
                onChange={(e) => setUpdateStock({...updateStock, quantity: Number(e.target.value)})}
                placeholder="Enter quantity"
              />
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">New Stock Level:</p>
              <p className="text-xl">
                {updateStock.operation === 'add' 
                  ? (selectedMaterial?.quantity || 0) + updateStock.quantity 
                  : Math.max(0, (selectedMaterial?.quantity || 0) - updateStock.quantity)
                } {selectedMaterial?.unit}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStock}>Update Stock</Button>
          </div>
        </DialogContent>
      </Dialog>
      <TabsContent value="suppliers" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Supplier Directory</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Supplier</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Supplier</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Supplier Name</Label>
                  <Input id="s_name" placeholder="e.g., Marina Supplies Inc." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input id="s_contact" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input id="s_phone" placeholder="+63 XXX XXX XXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input id="s_email" type="email" placeholder="vendor@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea id="s_address" placeholder="Company address..." />
                </div>
                <Button className="w-full" onClick={async () => {
                  const name = (document.getElementById('s_name') as HTMLInputElement).value;
                  const contact = (document.getElementById('s_contact') as HTMLInputElement).value;
                  const phone = (document.getElementById('s_phone') as HTMLInputElement).value;
                  const email = (document.getElementById('s_email') as HTMLInputElement).value;
                  const address = (document.getElementById('s_address') as HTMLTextAreaElement).value;
                  
                  if (!name) return toast.error('Supplier name is required');
                  
                  try {
                    const data = await apiFetch('/suppliers/', {
                      method: 'POST',
                      body: JSON.stringify({ name, contact_person: contact, phone, email, address })
                    });
                    setSuppliers([...suppliers, data]);
                    toast.success('Supplier added successfully');
                    // In a real app we'd close the dialog here, for simplicity we rely on manual close or state
                  } catch (e: any) {
                    toast.error('Failed to add supplier: ' + e.message);
                  }
                }}>Create Supplier</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold">{s.name}</TableCell>
                    <TableCell>{s.contact_person}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{s.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
