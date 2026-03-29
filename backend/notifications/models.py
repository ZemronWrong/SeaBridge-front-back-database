from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    Model for System Notifications and Alerts.
    Stores alerts for users (Owner, Finance, Foreman, Manager).
    """
    class NotificationType(models.TextChoices):
        SUCCESS = 'success', 'Success'
        INFO = 'info', 'Info'
        WARNING = 'warning', 'Warning'
        ERROR = 'error', 'Error'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=10,
        choices=NotificationType.choices,
        default=NotificationType.INFO
    )
    # Optional link to frontend route (e.g., 'inventory', 'production')
    link = models.CharField(max_length=100, blank=True, default='')
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"{self.user.username} - {self.title} ({'Read' if self.is_read else 'Unread'})"
