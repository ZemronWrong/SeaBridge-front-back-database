from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from accounts.serializers import UserSerializer
from production.models import Project
from production.serializers import ProjectSerializer
from .models import Material, MaterialRequest


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


class MaterialRequestSerializer(serializers.ModelSerializer):
    """Full read representation for material requests."""
    material = MaterialSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    requester = UserSerializer(read_only=True)

    class Meta:
        model = MaterialRequest
        fields = [
            'id',
            'request_id',
            'material',
            'project',
            'quantity',
            'requester',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class MaterialRequestCreateSerializer(serializers.ModelSerializer):
    """Foreman creates a pending request (material + project + quantity)."""
    material = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all())
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())

    class Meta:
        model = MaterialRequest
        fields = ['material', 'project', 'quantity', 'notes']

    def validate_quantity(self, value):
        if value < 1:
            raise ValidationError('Quantity must be at least 1.')
        return value


class MaterialRequestStatusSerializer(serializers.ModelSerializer):
    """Owner/Finance update status (and optional notes)."""
    class Meta:
        model = MaterialRequest
        fields = ['status', 'notes']

    def validate(self, attrs):
        instance = self.instance
        if instance.status == MaterialRequest.Status.FULFILLED:
            raise ValidationError('Fulfilled requests cannot be modified.')
        return attrs
