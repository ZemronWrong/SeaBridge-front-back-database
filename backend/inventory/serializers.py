from rest_framework import serializers
from .models import Material, Supplier, MaterialRequest, PurchaseOrder, PurchaseOrderItem


class MaterialSerializer(serializers.ModelSerializer):
    total_value = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    stock_status = serializers.CharField(read_only=True)
    supplier_name = serializers.SerializerMethodField()

    def get_supplier_name(self, obj):
        return obj.supplier.name if obj.supplier else "N/A"

    class Meta:
        model = Material
        fields = [
            'id', 'material_id', 'name', 'category', 'quantity',
            'unit', 'min_stock', 'unit_price', 'supplier', 'supplier_name',
            'last_updated', 'total_value', 'stock_status',
        ]
        read_only_fields = ['id', 'last_updated']


class StockUpdateSerializer(serializers.Serializer):
    """Serializer for stock add/subtract operations."""
    quantity = serializers.IntegerField(min_value=1)
    operation = serializers.ChoiceField(choices=['add', 'subtract'])


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class MaterialRequestSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    requester_name = serializers.CharField(source='requester.username', read_only=True)

    class Meta:
        model = MaterialRequest
        fields = [
            'id', 'material', 'material_name', 'quantity', 'project', 'project_name',
            'requester', 'requester_name', 'status', 'required_date', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['requester', 'created_at', 'updated_at']


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    total_price = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'material', 'material_name', 'quantity', 'unit_price', 'total_price']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    items = PurchaseOrderItemSerializer(many=True)
    total_cost = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'supplier', 'supplier_name', 'created_by', 'created_by_name',
            'status', 'expected_delivery', 'total_cost', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'po_number', 'total_cost']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # Generate a temporary PO number, we'll overwrite it to be strictly sequential
        base_po = PurchaseOrder.objects.create(**validated_data)
        base_po.po_number = f"PO-{base_po.id:04d}"
        base_po.save()

        for item_data in items_data:
            PurchaseOrderItem.objects.create(purchase_order=base_po, **item_data)
        
        return base_po
