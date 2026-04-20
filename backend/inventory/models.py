from django.db import models
from django.conf import settings
from production.models import Project


class Material(models.Model):
    material_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50)
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=30)
    min_stock = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.ForeignKey('Supplier', on_delete=models.SET_NULL, null=True, blank=True, related_name='materials')
    last_updated = models.DateField(auto_now=True)

    lead_time_days = models.IntegerField(default=7)
    avg_daily_usage = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    custom_reorder_point = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ['material_id']

    def __str__(self):
        return f'{self.material_id} - {self.name}'

    @property
    def total_value(self):
        return self.quantity * self.unit_price

    @property
    def reorder_point(self):
        if self.custom_reorder_point is not None:
            return float(self.custom_reorder_point)
        return float(self.avg_daily_usage) * self.lead_time_days + self.min_stock

    @property
    def stock_status(self):
        rp = self.reorder_point
        if rp == 0:
            return 'OK' if self.quantity > 0 else 'Critical'
        ratio = self.quantity / rp
        if ratio < 0.1:
            return 'Critical'
        if ratio < 0.5:
            return 'Low'
        if ratio <= 1.0:
            return 'Warning'
        return 'OK'

    @property
    def stock_percentage(self):
        rp = self.reorder_point
        if rp == 0:
            return 100
        return round((self.quantity / rp) * 100)


class Supplier(models.Model):
    name = models.CharField(max_length=200, unique=True)
    contact_person = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class MaterialRequest(models.Model):

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        APPROVED = 'Approved', 'Approved'
        ORDERED = 'Ordered', 'Ordered'
        FULFILLED = 'Fulfilled', 'Fulfilled'
        REJECTED = 'Rejected', 'Rejected'

    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='requests')
    quantity = models.PositiveIntegerField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='material_requests', null=True, blank=True)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='material_requests', null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    required_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.requester} requesting {self.quantity} {self.material.name} - {self.status}"


class PurchaseOrder(models.Model):

    class Status(models.TextChoices):
        DRAFT = 'Draft', 'Draft'
        SENT = 'Sent', 'Sent'
        RECEIVED = 'Received', 'Received'
        CANCELLED = 'Cancelled', 'Cancelled'

    po_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='purchase_orders')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    expected_delivery = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.po_number} - {self.supplier.name} ({self.status})"

    @property
    def total_cost(self):
        return sum(item.total_price for item in self.items.all())


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='po_items')
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ['purchase_order', 'material']

    def __str__(self):
        return f"{self.quantity}x {self.material.name} for {self.purchase_order.po_number}"

    @property
    def total_price(self):
        return self.quantity * self.unit_price


class LowStockAlert(models.Model):
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='stock_alerts')
    triggered_at = models.DateTimeField(auto_now_add=True)
    quantity_at_trigger = models.IntegerField()
    reorder_point_at_trigger = models.DecimalField(max_digits=10, decimal_places=2)
    acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        ordering = ['-triggered_at']

    def __str__(self):
        return f"Alert: {self.material.name} @ {self.quantity_at_trigger} units"
