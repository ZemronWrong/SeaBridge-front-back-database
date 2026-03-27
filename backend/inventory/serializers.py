from rest_framework import serializers
from .models import Material


class MaterialSerializer(serializers.ModelSerializer):
    total_value = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    stock_status = serializers.CharField(read_only=True)

    class Meta:
        model = Material
        fields = [
            'id', 'material_id', 'name', 'category', 'quantity',
            'unit', 'min_stock', 'unit_price', 'supplier',
            'last_updated', 'total_value', 'stock_status',
        ]
        read_only_fields = ['id', 'last_updated']


class StockUpdateSerializer(serializers.Serializer):
    """Serializer for stock add/subtract operations."""
    quantity = serializers.IntegerField(min_value=1)
    operation = serializers.ChoiceField(choices=['add', 'subtract'])
