from django.conf import settings
from django.db import models


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
    supplier = models.CharField(max_length=200, blank=True, default='')
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


class MaterialRequest(models.Model):
    """
    Foreman requests materials; Owner/Finance advance status and fulfill.
    Stock is deducted when status becomes Fulfilled.
    """

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        APPROVED = 'Approved', 'Approved'
        ORDERED = 'Ordered', 'Ordered'
        FULFILLED = 'Fulfilled', 'Fulfilled'

    request_id = models.CharField(max_length=20, unique=True, verbose_name='Request ID')
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name='material_requests',
    )
    project = models.ForeignKey(
        'production.Project',
        on_delete=models.CASCADE,
        related_name='material_requests',
    )
    quantity = models.PositiveIntegerField()
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='material_requests',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at', 'request_id']
        verbose_name = 'Material Request'
        verbose_name_plural = 'Material Requests'

    def __str__(self):
        return f'{self.request_id} — {self.material_id} × {self.quantity} ({self.status})'
