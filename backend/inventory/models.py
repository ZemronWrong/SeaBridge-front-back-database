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
