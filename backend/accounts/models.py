from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model with role-based access.
    Mirrors the frontend's UserRole type: owner | manager | finance | foreman | worker
    """

    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        MANAGER = 'manager', 'Manager'
        FINANCE = 'finance', 'Finance'
        FOREMAN = 'foreman', 'Foreman'
        WORKER = 'worker', 'Worker'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.WORKER,
    )
    # Optional link to the Employee record (for workers/foremen)
    employee_id = models.CharField(max_length=20, blank=True, default='')
    team_id = models.CharField(max_length=20, blank=True, default='')

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.get_role_display()})'
