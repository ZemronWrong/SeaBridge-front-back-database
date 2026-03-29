from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import CanManageInventory  # Reusing owner/finance permission

from .models import Customer, Invoice
from .serializers import CustomerSerializer, InvoiceSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [CanManageInventory]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('customer', 'project').all()
    serializer_class = InvoiceSerializer
    permission_classes = [CanManageInventory]

