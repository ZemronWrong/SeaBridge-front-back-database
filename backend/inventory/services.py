from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Material, MaterialRequest, LowStockAlert
from notifications.models import Notification

User = get_user_model()


def update_stock(material, quantity, operation):
    if operation == 'add':
        material.quantity += quantity
    else:
        material.quantity = max(0, material.quantity - quantity)
    material.save()
    check_low_stock(material)
    return material


def fulfill_request(material_request, user):
    if user.role not in ('owner', 'finance'):
        raise PermissionError('Only owners or finance can fulfill requests.')

    material = material_request.material
    if material.quantity < material_request.quantity:
        raise ValueError(f'Not enough stock. Available: {material.quantity}')

    material.quantity -= material_request.quantity
    material.save()
    material_request.status = 'Fulfilled'
    material_request.save()

    check_low_stock(material)
    return material_request


def receive_po(purchase_order):
    for item in purchase_order.items.all():
        material = item.material
        material.quantity += item.quantity
        material.save()
    purchase_order.status = 'Received'
    purchase_order.save()
    return purchase_order


def check_low_stock(material):
    """
    Create a LowStockAlert if material quantity is at or below reorder point.
    Skips if there's already an unacknowledged alert for this material.
    Notifies owner and manager roles.
    """
    rp = material.reorder_point
    if material.quantity > rp:
        return

    existing = LowStockAlert.objects.filter(material=material, acknowledged=False).exists()
    if existing:
        return

    LowStockAlert.objects.create(
        material=material,
        quantity_at_trigger=material.quantity,
        reorder_point_at_trigger=Decimal(str(rp)),
    )

    notify_users = User.objects.filter(role__in=['owner', 'manager', 'finance'])
    for user in notify_users:
        Notification.objects.create(
            user=user,
            title=f'Low Stock: {material.name}',
            message=f'{material.name} is at {material.quantity} {material.unit}. Reorder point is {rp}.',
            notification_type='warning',
            link='inventory',
        )


def recalculate_usage(material):
    """Recalculate avg_daily_usage from the last 30 days of fulfilled requests."""
    thirty_days_ago = timezone.now() - timedelta(days=30)

    fulfilled = MaterialRequest.objects.filter(
        material=material,
        status='Fulfilled',
        updated_at__gte=thirty_days_ago,
    )

    total_consumed = sum(r.quantity for r in fulfilled)
    material.avg_daily_usage = Decimal(str(total_consumed)) / Decimal('30')
    material.save(update_fields=['avg_daily_usage'])
    return material


def get_reorder_alerts(acknowledged=False):
    return LowStockAlert.objects.filter(acknowledged=acknowledged).select_related('material')


def acknowledge_alert(alert_id, user):
    try:
        alert = LowStockAlert.objects.get(id=alert_id)
    except LowStockAlert.DoesNotExist:
        raise ValueError('Alert not found.')

    alert.acknowledged = True
    alert.acknowledged_by = user
    alert.save()
    return alert
