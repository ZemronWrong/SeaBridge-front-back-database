import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Search, AlertTriangle, Package, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

interface InventoryModuleProps {}

interface Material {
  id: number;
  material_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock: number;
  unit_price: string | number;
  supplier: string;
  last_updated: string;
  total_value?: string | number;
  stock_status?: string;
}

export function InventoryModule() {
  const { user } = useAuth();
  const userRole = user?.role || 'worker';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const [materials, setMaterials] = useState<Material[]>([]);

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    min_stock: 0,
    unit_price: 0,
    supplier: ''
  });

  const [updateStock, setUpdateStock] = useState({
    quantity: 0,
    operation: 'add'
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await apiFetch('/materials/');
      setMaterials(data);
    } catch (error: any) {
      toast.error('Failed to load materials: ' + error.message);
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
      // Backend automatically sets ID if needed, but we pass what it needs or backend will generate.
      // Wait, backend material_id requires explicitly passing it or auto-generating. Let's auto-generate fallback if needed.
      const payload = {
        ...newMaterial,
        material_id: `MAT-${String(materials.length + 1).padStart(3, '0')}` // Simple generation, you could also modify backend to auto-generate
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

  const getStockStatus = (material: Material) => {
    const status = material.stock_status || (material.quantity <= material.min_stock ? 'Low Stock' : 'Good');
    if (status === 'Low Stock') {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (status === 'Warning') {
      return <Badge className="bg-orange-500">Warning</Badge>;
    }
    return <Badge className="bg-green-600">Good</Badge>;
  };

  const lowStockCount = Array.isArray(materials) ? materials.filter(m => m.quantity <= (m.min_stock || 0)).length : 0;
  const totalValue = Array.isArray(materials) ? materials.reduce((sum, m) => sum + ((m.quantity || 0) * Number(m.unit_price || 0)), 0) : 0;

  // Role-based permissions
  const canAddMaterial = ['owner', 'finance'].includes(userRole);
  const canUpdateStock = ['owner', 'finance', 'foreman'].includes(userRole);
  const isViewOnly = userRole === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-gray-600">
            {isViewOnly ? 'View material stock levels' : 'Track and manage material stock levels'}
          </p>
        </div>
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
                <div className="space-y-2 col-span-2">
                  <Label>Supplier</Label>
                  <Input 
                    value={newMaterial.supplier}
                    onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                    placeholder="Supplier name"
                  />
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
                <TableHead>Total Value</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Last Updated</TableHead>
                {canUpdateStock && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.id}</TableCell>
                  <TableCell>{material.name}</TableCell>
                  <TableCell>{material.category}</TableCell>
                  <TableCell>{material.quantity || 0} {material.unit}</TableCell>
                  <TableCell>{material.min_stock || 0} {material.unit}</TableCell>
                  <TableCell>{getStockStatus(material)}</TableCell>
                  <TableCell>₱{Number(material.unit_price || 0).toLocaleString()}</TableCell>
                  <TableCell>₱{((material.quantity || 0) * Number(material.unit_price || 0)).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{material.supplier}</TableCell>
                  <TableCell className="text-sm">{material.last_updated ? material.last_updated.substring(0, 10) : '-'}</TableCell>
                  {canUpdateStock && (
                    <TableCell>
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
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
    </div>
  );
}
