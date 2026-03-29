from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManageInventory
from .models import Material, Supplier, MaterialRequest, PurchaseOrder, PurchaseOrderItem
from .serializers import (
    MaterialSerializer,
    StockUpdateSerializer,
    SupplierSerializer,
    MaterialRequestSerializer,
    PurchaseOrderSerializer,
)


class MaterialViewSet(viewsets.ModelViewSet):
    """
    CRUD for materials.
    GET    /api/materials/          — list all materials
    POST   /api/materials/          — create a new material (owner/finance)
    GET    /api/materials/<pk>/     — retrieve one material
    PUT    /api/materials/<pk>/     — full update (owner/finance)
    PATCH  /api/materials/<pk>/     — partial update (owner/finance/foreman)
    DELETE /api/materials/<pk>/     — delete (owner/finance)
    POST   /api/materials/<pk>/update_stock/ — add/subtract stock
    """
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [CanManageInventory]
    filterset_fields = ['category']

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '')
        category = self.request.query_params.get('category', '')
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(material_id__icontains=search)
        if category and category != 'all':
            qs = qs.filter(category=category)
        return qs.distinct()

    @action(detail=True, methods=['post'], url_path='update-stock')
    def update_stock(self, request, pk=None):
        """Add or subtract stock for a material."""
        material = self.get_object()
        serializer = StockUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        qty = serializer.validated_data['quantity']
        op = serializer.validated_data['operation']

        if op == 'add':
            material.quantity += qty
        else:
            material.quantity = max(0, material.quantity - qty)

        material.save()
        return Response(MaterialSerializer(material).data)


class SupplierViewSet(viewsets.ModelViewSet):
    """
    CRUD for suppliers.
    owner/finance full access.
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [CanManageInventory]


class MaterialRequestViewSet(viewsets.ModelViewSet):
    """
    Material requests for foremen.
    Foreman: create requests, view their own.
    Owner/Finance: View all, update status.
    """
    queryset = MaterialRequest.objects.select_related('material', 'project', 'requester').all()
    serializer_class = MaterialRequestSerializer
    permission_classes = [CanManageInventory]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        # Foremen only see their own requests (optional, but good for focus).
        # Let's let them see all requests for now but uncomment if we want isolation
        # if user.role == 'foreman':
        #     qs = qs.filter(requester=user)
            
        return qs

    def perform_create(self, serializer):
        # Auto-set the requester to the logged-in user
        serializer.save(requester=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        new_status = serializer.validated_data.get('status', instance.status)

        # 1. Permission check: Only owner/finance can approve/fulfill
        if new_status != instance.status and user.role not in ('owner', 'finance'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only owners or finance managers can change request statuses.")

        # 2. Business Logic: Inventory Deduction when Fulfilled
        if instance.status != 'Fulfilled' and new_status == 'Fulfilled':
            material = instance.material
            if material.quantity < instance.quantity:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"error": f"Not enough stock in inventory to fulfill request. Available: {material.quantity}"})
            
            # Deduct stock
            material.quantity -= instance.quantity
            material.save()
            
        serializer.save()


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """
    CRUD for Purchase Orders.
    Owner/Finance only.
    """
    queryset = PurchaseOrder.objects.prefetch_related('items__material', 'supplier', 'created_by').all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [CanManageInventory]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = serializer.validated_data.get('status', instance.status)

        # Business Logic: Inventory Addition when Received
        if instance.status != 'Received' and new_status == 'Received':
            for item in instance.items.all():
                material = item.material
                material.quantity += item.quantity
                material.save()
                
        serializer.save()
