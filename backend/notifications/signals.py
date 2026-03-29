from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from inventory.models import Material, MaterialRequest, PurchaseOrder
from production.models import QualityCheck
from .models import Notification

User = get_user_model()


@receiver(post_save, sender=Material)
def low_stock_notification(sender, instance, **kwargs):
    """
    Alert Owner and Finance when material quantity drops below min_stock.
    """
    if instance.quantity <= instance.min_stock:
        # Avoid duplicate unread notifications for the same item
        owner_users = User.objects.filter(role__in=['owner', 'finance'])
        for user in owner_users:
            if not Notification.objects.filter(user=user, title__contains=instance.name, is_read=False).exists():
                Notification.objects.create(
                    user=user,
                    title=f"Low Stock Alert: {instance.name}",
                    message=f"Stock for {instance.name} is at {instance.quantity} {instance.unit}. Minimum stock is {instance.min_stock}.",
                    notification_type=Notification.NotificationType.WARNING,
                    link="inventory"
                )


@receiver(post_save, sender=MaterialRequest)
def material_request_notification(sender, instance, created, **kwargs):
    """
    Alert Owner and Finance on new material requests.
    Alert Foreman/Requester when status changes.
    """
    if created:
        # New request alert for management
        admins = User.objects.filter(role__in=['owner', 'finance'])
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title=f"New Material Request",
                message=f"{instance.requester_name if hasattr(instance, 'requester_name') else instance.requester} has requested {instance.quantity} {instance.material.name}.",
                notification_type=Notification.NotificationType.INFO,
                link="inventory"
            )
    else:
        # Status change alert for requester
        if instance.requester:
            Notification.objects.create(
                user=instance.requester,
                title=f"Material Request {instance.status}",
                message=f"Your request for {instance.quantity} {instance.material.name} has been marked as {instance.status}.",
                notification_type=Notification.NotificationType.SUCCESS if instance.status in ['Approved', 'Fulfilled'] else Notification.NotificationType.INFO,
                link="inventory"
            )


@receiver(post_save, sender=PurchaseOrder)
def po_status_notification(sender, instance, created, **kwargs):
    """
    Alert Finance when a PO status changes (e.g., Received).
    """
    if not created:
        finance_users = User.objects.filter(role='finance')
        for user in finance_users:
            Notification.objects.create(
                user=user,
                title=f"PO Status Updated: {instance.po_number}",
                message=f"Purchase Order {instance.po_number} is now marked as {instance.status}.",
                notification_type=Notification.NotificationType.SUCCESS if instance.status == 'Received' else Notification.NotificationType.INFO,
                link="inventory"
            )


@receiver(post_save, sender=QualityCheck)
def qc_failure_notification(sender, instance, created, **kwargs):
    """
    Alert Manager and relevant Foreman when a QC inspection fails.
    """
    if instance.result == 'Fail':
        involved_roles = User.objects.filter(role__in=['manager', 'foreman', 'owner'])
        for user in involved_roles:
            Notification.objects.create(
                user=user,
                title=f"QC Failure: {instance.project_name}",
                message=f"A quality check for {instance.project_name} has failed on {instance.inspection_item}.",
                notification_type=Notification.NotificationType.ERROR,
                link="production"
            )
