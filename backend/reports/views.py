from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from inventory.models import Material, PurchaseOrder
from production.models import Project
from sales.models import Invoice


class DashboardAnalyticsView(APIView):
    """
    Single aggregated analytics endpoint for the reporting dashboard.
    Returns three datasets:
      1. expenditures  → monthly PO costs
      2. production    → project status breakdown
      3. inventory     → value by category
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'expenditures': self._get_expenditures(),
            'production':   self._get_production(),
            'inventory':    self._get_inventory_value(),
            'invoices':     self._get_invoice_summary(),
        })

    # ── 1. Expenditure Trends ────────────────────────────────────────────────
    def _get_expenditures(self):
        """Monthly totals from Received Purchase Orders."""
        rows = (
            PurchaseOrder.objects
            .filter(status='Received')
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Sum('items__unit_price') * 0)  # placeholder — real sum below
            .order_by('month')
        )

        # Use a raw approach to avoid decimal ORM quirk with nested Sum
        from django.db.models import F
        from inventory.models import PurchaseOrderItem

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
                'total': float(row['total'] or 0),
            }
            for row in raw
        ]

    # ── 2. Production Efficiency ─────────────────────────────────────────────
    def _get_production(self):
        """High-level project status breakdown for bar chart."""
        projects = Project.objects.values('project_id', 'name', 'progress', 'status', 'deadline')
        today = __import__('datetime').date.today()
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

    # ── 3. Inventory Valuation ───────────────────────────────────────────────
    def _get_inventory_value(self):
        """Total (quantity × unit_price) grouped by category."""
        from django.db.models import F as DjF
        cats = (
            Material.objects
            .values('category')
            .annotate(value=Sum(DjF('quantity') * DjF('unit_price')))
            .order_by('-value')
        )
        return [
            {'category': row['category'], 'value': float(row['value'] or 0)}
            for row in cats
        ]

    # ── 4. Invoice Summary ───────────────────────────────────────────────────
    def _get_invoice_summary(self):
        """Count invoices per status."""
        rows = Invoice.objects.values('status').annotate(count=Count('id'))
        return [{'status': r['status'], 'count': r['count']} for r in rows]
