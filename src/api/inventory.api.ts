import { apiFetch } from './client';
import { Material, Supplier, MaterialRequest, PurchaseOrder } from '../types/inventory';

export const inventoryApi = {
  getMaterials: () => apiFetch('/materials/') as Promise<Material[]>,
  
  createMaterial: (payload: any) => apiFetch('/materials/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as Promise<Material>,
  
  updateStock: (id: number, quantity: number, operation: string) => apiFetch(`/materials/${id}/update-stock/`, {
    method: 'POST',
    body: JSON.stringify({ quantity, operation })
  }) as Promise<Material>,

  getSuppliers: () => apiFetch('/suppliers/') as Promise<Supplier[]>,

  getRequests: () => apiFetch('/material-requests/') as Promise<MaterialRequest[]>,
  
  createRequest: (payload: any) => apiFetch('/material-requests/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as Promise<MaterialRequest>,
  
  updateRequestStatus: (id: number, status: string) => apiFetch(`/material-requests/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }) as Promise<MaterialRequest>,

  getPurchaseOrders: () => apiFetch('/purchase-orders/') as Promise<PurchaseOrder[]>,
  
  createPurchaseOrder: (payload: any) => apiFetch('/purchase-orders/', {
    method: 'POST',
    body: JSON.stringify(payload)
  }) as Promise<PurchaseOrder>,
  
  updatePurchaseOrderStatus: (id: number, status: string) => apiFetch(`/purchase-orders/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }) as Promise<PurchaseOrder>,
};
