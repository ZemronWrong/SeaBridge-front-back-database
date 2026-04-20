from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from inventory.models import Material, MaterialRequest, PurchaseOrder
from production.models import QualityCheck
from dtr.models import DTRRecord
from .models import Notification

User = get_user_model()


@receiver(post_save, sender=Material)
def low_stock_notification(sender, instance, **kwargs):
    rp = instance.reorder_point
    if instance.quantity > rp:
        return

    notify_users = User.objects.filter(role__in=['owner', 'finance'])
    for user in notify_users:
        existing = Notification.objects.filter(
            user=user, title__contains=instance.name, is_read=False
        ).exists()
        if not existing:
            Notification.objects.create(
                user=user,
                title=f'Low Stock: {instance.name}',
                message=f'{instance.name} at {instance.quantity} {instance.unit} (reorder point: {rp}).',
                notification_type='warning',
                link='inventory',
            )


@receiver(post_save, sender=MaterialRequest)
def material_request_notification(sender, instance, created, **kwargs):
    if created:
        admins = User.objects.filter(role__in=['owner', 'finance'])
        requester_name = instance.requester.get_full_name() if instance.requester else 'Unknown'
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title='New Material Request',
                message=f'{requester_name} requested {instance.quantity} {instance.material.name}.',
                notification_type='info',
                link='inventory',
            )
    elif instance.requester:
        ntype = 'success' if instance.status in ('Approved', 'Fulfilled') else 'info'
        Notification.objects.create(
            user=instance.requester,
            title=f'Material Request {instance.status}',
            message=f'Your request for {instance.quantity} {instance.material.name}: {instance.status}.',
            notification_type=ntype,
            link='inventory',
        )


@receiver(post_save, sender=PurchaseOrder)
def po_status_notification(sender, instance, created, **kwargs):
    if created:
        return
    finance_users = User.objects.filter(role='finance')
    ntype = 'success' if instance.status == 'Received' else 'info'
    for user in finance_users:
        Notification.objects.create(
            user=user,
            title=f'PO Update: {instance.po_number}',
            message=f'{instance.po_number} is now {instance.status}.',
            notification_type=ntype,
            link='inventory',
        )


@receiver(post_save, sender=QualityCheck)
def qc_failure_notification(sender, instance, created, **kwargs):
    if instance.result != 'Fail':
        return
    project_name = instance.project.name if instance.project else 'Unknown'
    notify_users = User.objects.filter(role__in=['manager', 'foreman', 'owner'])
    for user in notify_users:
        Notification.objects.create(
            user=user,
            title=f'QC Failure: {project_name}',
            message=f'QC failed on {instance.inspection_item} for {project_name}.',
            notification_type='error',
            link='production',
        )


@receiver(post_save, sender=DTRRecord)
def auto_clockout_notification(sender, instance, **kwargs):
    if not instance.auto_clocked_out:
        return
    if not instance.requires_adjustment:
        return

    managers = User.objects.filter(role__in=['owner', 'manager'], team_id=instance.team_id)
    for user in managers:
        existing = Notification.objects.filter(
            user=user,
            title=f'Auto Clock-out: {instance.employee.name}',
            is_read=False,
        ).exists()
        if not existing:
            Notification.objects.create(
                user=user,
                title=f'Auto Clock-out: {instance.employee.name}',
                message=f'{instance.employee.name} was auto-clocked out on {instance.date}. Needs adjustment review.',
                notification_type='warning',
                link='dtr',
            )
