from django.contrib import admin
from .models import Material


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ['material_id', 'name', 'category', 'quantity', 'unit', 'min_stock', 'unit_price', 'supplier', 'last_updated']
    list_filter = ['category']
    search_fields = ['name', 'material_id', 'supplier']
    list_editable = ['quantity']
