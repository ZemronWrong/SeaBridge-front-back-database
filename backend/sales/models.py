from django.db import models
from production.models import Project

class Customer(models.Model):
    name = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    address = models.TextField(blank=True, default='')
    preferences = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'

    def __str__(self):
        return f"{self.name} ({self.company})" if self.company else self.name


class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'Draft', 'Draft'
        SENT = 'Sent', 'Sent'
        PAID = 'Paid', 'Paid'
        OVERDUE = 'Overdue', 'Overdue'

    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    
    amount_due = models.DecimalField(max_digits=14, decimal_places=2, help_text="Flat total price billed")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    issued_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-issued_date']
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

    def __str__(self):
        return f"{self.invoice_number} to {self.customer.name}"
