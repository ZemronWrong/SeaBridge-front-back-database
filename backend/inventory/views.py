from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from accounts.permissions import CanManageInventory, MaterialRequestPermission
from .models import Material, MaterialRequest
from .serializers import (
    MaterialSerializer,
    StockUpdateSerializer,
    MaterialRequestSerializer,
    MaterialRequestCreateSerializer,
    MaterialRequestStatusSerializer,
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


class MaterialRequestViewSet(viewsets.ModelViewSet):
    """
    Foreman creates requests (POST). Owner/Finance update status (PATCH).
    When status becomes Fulfilled, inventory stock is reduced automatically.
    """
    queryset = MaterialRequest.objects.select_related(
        'material', 'project', 'requester',
    ).all()
    permission_classes = [MaterialRequestPermission]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if getattr(user, 'role', None) == 'foreman':
            return qs.filter(requester=user)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return MaterialRequestCreateSerializer
        if self.action in ('update', 'partial_update'):
            return MaterialRequestStatusSerializer
        return MaterialRequestSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        last = MaterialRequest.objects.order_by('-id').first()
        next_num = (last.id + 1) if last else 1
        request_id = f'MR-{next_num:03d}'
        serializer.save(
            request_id=request_id,
            requester=self.request.user,
            status=MaterialRequest.Status.PENDING,
        )

    @transaction.atomic
    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.status == MaterialRequest.Status.FULFILLED:
            raise ValidationError({'detail': 'Fulfilled requests cannot be modified.'})

        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)

        if (
            new_status == MaterialRequest.Status.FULFILLED
            and old_status != MaterialRequest.Status.FULFILLED
        ):
            material = Material.objects.select_for_update().get(pk=instance.material_id)
            if material.quantity < instance.quantity:
                raise ValidationError(
                    {'status': 'Insufficient stock to fulfill this request.'}
                )

        serializer.save()

        if (
            new_status == MaterialRequest.Status.FULFILLED
            and old_status != MaterialRequest.Status.FULFILLED
        ):
            material = Material.objects.select_for_update().get(pk=instance.material_id)
            material.quantity -= instance.quantity
            material.save(update_fields=['quantity', 'last_updated'])
