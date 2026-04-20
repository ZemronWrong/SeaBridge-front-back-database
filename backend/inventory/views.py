from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManageInventory
from . import services
from .models import Material, Supplier, MaterialRequest, PurchaseOrder, LowStockAlert
from .serializers import (
    MaterialSerializer,
    StockUpdateSerializer,
    SupplierSerializer,
    MaterialRequestSerializer,
    PurchaseOrderSerializer,
    LowStockAlertSerializer,
)


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [CanManageInventory]

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
        material = self.get_object()
        serializer = StockUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        material = services.update_stock(
            material,
            serializer.validated_data['quantity'],
            serializer.validated_data['operation'],
        )
        return Response(MaterialSerializer(material).data)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [CanManageInventory]


class MaterialRequestViewSet(viewsets.ModelViewSet):
    queryset = MaterialRequest.objects.select_related('material', 'project', 'requester').all()
    serializer_class = MaterialRequestSerializer
    permission_classes = [CanManageInventory]

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = serializer.validated_data.get('status', instance.status)

        if new_status != instance.status and self.request.user.role not in ('owner', 'finance'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only owners or finance can change request statuses.')

        if instance.status != 'Fulfilled' and new_status == 'Fulfilled':
            services.fulfill_request(instance, self.request.user)
            return

        serializer.save()


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.prefetch_related('items__material', 'supplier', 'created_by').all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [CanManageInventory]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = serializer.validated_data.get('status', instance.status)

        if instance.status != 'Received' and new_status == 'Received':
            services.receive_po(instance)
            return

        serializer.save()


class LowStockAlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LowStockAlert.objects.select_related('material').all()
    serializer_class = LowStockAlertSerializer
    permission_classes = [CanManageInventory]

    def get_queryset(self):
        qs = super().get_queryset()
        show_all = self.request.query_params.get('all', 'false').lower() == 'true'
        if not show_all:
            qs = qs.filter(acknowledged=False)
        return qs

    @action(detail=True, methods=['post'], url_path='acknowledge')
    def acknowledge(self, request, pk=None):
        try:
            alert = services.acknowledge_alert(pk, request.user)
            return Response(LowStockAlertSerializer(alert).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
