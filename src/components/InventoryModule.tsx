import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Plus, Search, AlertTriangle, Package, Edit } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface InventoryModuleProps {
  userRole: string;
}

interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
}

export function InventoryModule({ userRole }: InventoryModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const [materials, setMaterials] = useState<Material[]>([
    { id: 'MAT-001', name: 'Marine Plywood 4x8', category: 'Wood', quantity: 12, unit: 'sheets', minStock: 20, unitPrice: 2500, supplier: 'Davao Lumber Supply', lastUpdated: '2025-11-08' },
    { id: 'MAT-002', name: 'Epoxy Resin', category: 'Chemicals', quantity: 15, unit: 'liters', minStock: 25, unitPrice: 850, supplier: 'Marine Tech Philippines', lastUpdated: '2025-11-07' },
    { id: 'MAT-003', name: 'Fiberglass Cloth', category: 'Fabric', quantity: 8, unit: 'rolls', minStock: 15, unitPrice: 1200, supplier: 'Composite Materials Inc', lastUpdated: '2025-11-06' },
    { id: 'MAT-004', name: 'Stainless Steel Bolts M12', category: 'Hardware', quantity: 45, unit: 'pcs', minStock: 100, unitPrice: 15, supplier: 'Steel & Fasteners Co', lastUpdated: '2025-11-08' },
    { id: 'MAT-005', name: 'Marine Paint (White)', category: 'Paint', quantity: 35, unit: 'liters', minStock: 20, unitPrice: 750, supplier: 'Marine Coatings Ltd', lastUpdated: '2025-11-05' },
    { id: 'MAT-006', name: 'Yamaha 250HP Engine', category: 'Engine', quantity: 2, unit: 'units', minStock: 2, unitPrice: 450000, supplier: 'Yamaha Marine Davao', lastUpdated: '2025-11-01' },
    { id: 'MAT-007', name: 'Aluminum Sheet 4x8', category: 'Metal', quantity: 25, unit: 'sheets', minStock: 15, unitPrice: 3200, supplier: 'Metro Aluminum', lastUpdated: '2025-11-08' },
    { id: 'MAT-008', name: 'Hydraulic Steering System', category: 'Equipment', quantity: 5, unit: 'units', minStock: 3, unitPrice: 25000, supplier: 'Marine Parts Depot', lastUpdated: '2025-11-04' },
  ]);

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minStock: 0,
    unitPrice: 0,
    supplier: ''
  });

  const [updateStock, setUpdateStock] = useState({
    quantity: 0,
    operation: 'add'
  });

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(materials.map(m => m.category)))];

  const handleAddMaterial = () => {
    const newId = `MAT-${String(materials.length + 1).padStart(3, '0')}`;
    const material: Material = {
      id: newId,
      ...newMaterial,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setMaterials([...materials, material]);
    setIsAddDialogOpen(false);
    setNewMaterial({ name: '', category: '', quantity: 0, unit: '', minStock: 0, unitPrice: 0, supplier: '' });
    toast.success('Material added successfully');
  };

  const handleUpdateStock = () => {
    if (!selectedMaterial) return;
    
    setMaterials(materials.map(m => {
      if (m.id === selectedMaterial.id) {
        const newQuantity = updateStock.operation === 'add' 
          ? m.quantity + updateStock.quantity 
          : Math.max(0, m.quantity - updateStock.quantity);
        return { ...m, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return m;
    }));
    
    setIsUpdateDialogOpen(false);
    setUpdateStock({ quantity: 0, operation: 'add' });
    toast.success('Stock updated successfully');
  };

  const getStockStatus = (material: Material) => {
    if (material.quantity <= material.minStock) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else if (material.quantity <= material.minStock * 1.5) {
      return <Badge className="bg-orange-500">Warning</Badge>;
    }
    return <Badge className="bg-green-600">Good</Badge>;
  };

  const lowStockCount = materials.filter(m => m.quantity <= m.minStock).length;
  const totalValue = materials.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);

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
                    value={newMaterial.minStock}
                    onChange={(e) => setNewMaterial({...newMaterial, minStock: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price (₱)</Label>
                  <Input 
                    type="number"
                    value={newMaterial.unitPrice}
                    onChange={(e) => setNewMaterial({...newMaterial, unitPrice: Number(e.target.value)})}
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
                  <TableCell>{material.quantity} {material.unit}</TableCell>
                  <TableCell>{material.minStock} {material.unit}</TableCell>
                  <TableCell>{getStockStatus(material)}</TableCell>
                  <TableCell>₱{material.unitPrice.toLocaleString()}</TableCell>
                  <TableCell>₱{(material.quantity * material.unitPrice).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{material.supplier}</TableCell>
                  <TableCell className="text-sm">{material.lastUpdated}</TableCell>
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
              <Select value={updateStock.operation} onValueChange={(v) => setUpdateStock({...updateStock, operation: v})}>
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
