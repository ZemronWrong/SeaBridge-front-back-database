from rest_framework import serializers
from .models import Customer, Invoice

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    project_code = serializers.CharField(source='project.project_id', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'customer_name',
            'project', 'project_name', 'project_code',
            'amount_due', 'status', 'issued_date', 'due_date', 'notes'
        ]
        read_only_fields = ['issued_date']
