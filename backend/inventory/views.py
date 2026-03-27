from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManageInventory
from .models import Material
from .serializers import MaterialSerializer, StockUpdateSerializer


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
