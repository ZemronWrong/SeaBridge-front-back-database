from decimal import Decimal
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from inventory.models import Material, PurchaseOrderItem
from production.models import Project
from sales.models import Invoice

import datetime


class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'expenditures': self._get_expenditures(),
            'production': self._get_production(),
            'inventory': self._get_inventory_value(),
            'invoices': self._get_invoice_summary(),
        })

    def _get_expenditures(self):
        raw = (
            PurchaseOrderItem.objects
            .filter(purchase_order__status='Received')
            .annotate(month=TruncMonth('purchase_order__created_at'))
            .values('month')
            .annotate(total=Sum(F('quantity') * F('unit_price')))
            .order_by('month')
        )
        return [
            {
                'month': row['month'].strftime('%b %Y'),
                'total': str(row['total'] or Decimal('0')),
            }
            for row in raw
        ]

    def _get_production(self):
        projects = Project.objects.values('project_id', 'name', 'progress', 'status', 'deadline')
        today = datetime.date.today()
        result = []
        for p in projects:
            overdue = p['deadline'] < today and p['status'] not in ('Completed', 'Done')
            result.append({
                'name': p['project_id'],
                'label': p['name'],
                'progress': p['progress'],
                'status': p['status'],
                'overdue': overdue,
            })
        return result

    def _get_inventory_value(self):
        cats = (
            Material.objects
            .values('category')
            .annotate(value=Sum(F('quantity') * F('unit_price')))
            .order_by('-value')
        )
        return [
            {'category': row['category'], 'value': str(row['value'] or Decimal('0'))}
            for row in cats
        ]

    def _get_invoice_summary(self):
        rows = Invoice.objects.values('status').annotate(count=Count('id'))
        return [{'status': r['status'], 'count': r['count']} for r in rows]
