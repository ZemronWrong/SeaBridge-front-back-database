import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'seabridge.settings')
django.setup()

from notifications.models import Notification
from accounts.models import CustomUser

def trigger_test_notifications():
    owner = CustomUser.objects.filter(role='owner').first()
    foreman = CustomUser.objects.filter(role='foreman').first()
    
    if owner:
        Notification.objects.create(
            user=owner,
            title="System Maintenance Trace",
            message="This is a test notification for the Owner regarding system performance.",
            notification_type='info',
            link='analytics'
        )
        print(f"Created notification for {owner.username}")

    if foreman:
        Notification.objects.create(
            user=foreman,
            title="Material Request Approved",
            message="Your request for Marine Plywood has been approved by Finance.",
            notification_type='success',
            link='inventory'
        )
        print(f"Created notification for {foreman.username}")

if __name__ == "__main__":
    trigger_test_notifications()
