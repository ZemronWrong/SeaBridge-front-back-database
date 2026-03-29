from django.db import models
from django.conf import settings
from production.models import Project


class Material(models.Model):
    """
    Inventory material item.
    Mirrors the frontend's Material interface in InventoryModule.tsx.
    """
    material_id = models.CharField(max_length=20, unique=True, verbose_name='Material ID')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50)
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=30)
    min_stock = models.IntegerField(default=0, verbose_name='Minimum Stock Level')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Unit Price (₱)')
    supplier = models.ForeignKey('Supplier', on_delete=models.SET_NULL, null=True, blank=True, related_name='materials')
    last_updated = models.DateField(auto_now=True)

    class Meta:
        ordering = ['material_id']
        verbose_name = 'Material'
        verbose_name_plural = 'Materials'

    def __str__(self):
        return f'{self.material_id} - {self.name}'

    @property
    def total_value(self):
        return self.quantity * self.unit_price

    @property
    def stock_status(self):
        if self.quantity <= self.min_stock:
            return 'Low Stock'
        elif self.quantity <= self.min_stock * 1.5:
            return 'Warning'
        return 'Good'


class Supplier(models.Model):
    """
    Directory of material vendors/suppliers.
    """
    name = models.CharField(max_length=200, unique=True)
    contact_person = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'

    def __str__(self):
        return self.name


class MaterialRequest(models.Model):
    """
    Tracks requested materials from shop floor to fulfillment.
    """
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        APPROVED = 'Approved', 'Approved'
        ORDERED = 'Ordered', 'Ordered'
        FULFILLED = 'Fulfilled', 'Fulfilled'
        REJECTED = 'Rejected', 'Rejected'

    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='requests')
    quantity = models.PositiveIntegerField()
    # Tie to specific project for job costing
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='material_requests', null=True, blank=True)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='material_requests', null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    required_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Material Request'
        verbose_name_plural = 'Material Requests'

    def __str__(self):
        return f"{self.requester} requesting {self.quantity} {self.material.name} - {self.status}"


class PurchaseOrder(models.Model):
    """
    Formal procurement order to a Supplier to restock inventory.
    """
    class Status(models.TextChoices):
        DRAFT = 'Draft', 'Draft'
        SENT = 'Sent', 'Sent'
        RECEIVED = 'Received', 'Received'
        CANCELLED = 'Cancelled', 'Cancelled'

    po_number = models.CharField(max_length=50, unique=True, verbose_name='PO Number')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='purchase_orders')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    expected_delivery = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Purchase Order'
        verbose_name_plural = 'Purchase Orders'

    def __str__(self):
        return f"{self.po_number} - {self.supplier.name} ({self.status})"
        
    @property
    def total_cost(self):
        return sum(item.total_price for item in self.items.all())


class PurchaseOrderItem(models.Model):
    """
    Individual items within a Purchase Order.
    """
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='po_items')
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Price at time of order")
    
    class Meta:
        unique_together = ['purchase_order', 'material']

    def __str__(self):
        return f"{self.quantity}x {self.material.name} for {self.purchase_order.po_number}"
        
    @property
    def total_price(self):
        return self.quantity * self.unit_price
