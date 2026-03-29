from django.contrib import admin
from .models import Material, MaterialRequest


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ['material_id', 'name', 'category', 'quantity', 'unit', 'min_stock', 'unit_price', 'supplier', 'last_updated']
    list_filter = ['category']
    search_fields = ['name', 'material_id', 'supplier']
    list_editable = ['quantity']


@admin.register(MaterialRequest)
class MaterialRequestAdmin(admin.ModelAdmin):
    list_display = ['request_id', 'material', 'project', 'quantity', 'requester', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['request_id', 'material__name', 'project__name']
    raw_id_fields = ['material', 'project', 'requester']
