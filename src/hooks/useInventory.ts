import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { inventoryApi } from '../api/inventory.api';
import { Material, Supplier, MaterialRequest, PurchaseOrder } from '../types/inventory';
import { Project } from '../types/project';
import { productionApi } from '../api/production.api';

export function useInventory() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matData, supData, reqData, projData, poData] = await Promise.all([
        inventoryApi.getMaterials(),
        inventoryApi.getSuppliers(),
        inventoryApi.getRequests(),
        productionApi.getProjects().catch(() => []), // May 403 for some
        inventoryApi.getPurchaseOrders().catch(() => []) // May 403 for some
      ]);
      setMaterials(matData || []);
      setSuppliers(supData || []);
      setRequests(reqData || []);
      setProjects(projData || []);
      setPurchaseOrders(poData || []);
    } catch (e: any) {
      toast.error('Failed to load inventory data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = async (payload: any) => {
    try {
      const saved = await inventoryApi.createMaterial(payload);
      setMaterials([...materials, saved]);
      toast.success('Material added successfully');
      return true;
    } catch (e: any) {
      toast.error('Failed to add material: ' + e.message);
      return false;
    }
  };

  const updateStock = async (id: number, quantity: number, operation: string) => {
    try {
      const updated = await inventoryApi.updateStock(id, quantity, operation);
      setMaterials(materials.map(m => m.id === id ? updated : m));
      toast.success('Stock updated successfully');
      return true;
    } catch (e: any) {
      toast.error('Failed to update stock: ' + e.message);
      return false;
    }
  };

  const createRequest = async (payload: any) => {
    try {
      const saved = await inventoryApi.createRequest(payload);
      setRequests([...requests, saved]);
      toast.success('Material requested successfully');
      return true;
    } catch (e: any) {
      toast.error('Failed to create request: ' + e.message);
      return false;
    }
  };

  const updateRequestStatus = async (id: number, status: string) => {
    try {
      const updated = await inventoryApi.updateRequestStatus(id, status);
      setRequests(requests.map(r => r.id === id ? updated : r));
      
      // Attempt to refresh materials in case stock was depleted by fulfillment
      if (status === 'Fulfilled') {
        inventoryApi.getMaterials().then(m => setMaterials(m)).catch(() => {});
      }
      
      toast.success(`Request ${status}`);
    } catch (e: any) {
      toast.error('Failed to update request: ' + e.message);
    }
  };

  const createPurchaseOrder = async (payload: any) => {
    try {
      const saved = await inventoryApi.createPurchaseOrder(payload);
      setPurchaseOrders([...purchaseOrders, saved]);
      toast.success('Purchase Order created successfully');
      return true;
    } catch (e: any) {
      toast.error('Failed to create PO: ' + e.message);
      return false;
    }
  };

  const updatePurchaseOrderStatus = async (id: number, status: string) => {
    try {
      const updated = await inventoryApi.updatePurchaseOrderStatus(id, status);
      setPurchaseOrders(purchaseOrders.map(po => po.id === id ? updated : po));
      
      if (status === 'Received') {
         inventoryApi.getMaterials().then(m => setMaterials(m)).catch(() => {});
      }
      
      toast.success(`PO updated to ${status}`);
    } catch (e: any) {
      toast.error('Failed to update PO: ' + e.message);
    }
  };

  return {
    materials,
    suppliers,
    requests,
    projects,
    purchaseOrders,
    loading,
    addMaterial,
    updateStock,
    createRequest,
    updateRequestStatus,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    refreshData: fetchData
  };
}
