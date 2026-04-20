from django.db import models
from django.conf import settings


class DTRRecord(models.Model):

    class Status(models.TextChoices):
        PRESENT = 'Present', 'Present'
        ABSENT = 'Absent', 'Absent'
        ON_LEAVE = 'On Leave', 'On Leave'

    dtr_id = models.CharField(max_length=20, unique=True)
    employee = models.ForeignKey('payroll.Employee', on_delete=models.CASCADE, related_name='dtr_records')
    team_id = models.CharField(max_length=20, default='TEAM-A')
    date = models.DateField()
    time_in = models.CharField(max_length=10, default='-')
    time_out = models.CharField(max_length=10, default='-')
    break_minutes = models.IntegerField(default=0)
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PRESENT)

    auto_clocked_out = models.BooleanField(default=False)
    requires_adjustment = models.BooleanField(default=False)
    adjustment_approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='approved_adjustments'
    )
    adjustment_note = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-date', 'dtr_id']
        unique_together = ['employee', 'date']

    def __str__(self):
        return f'{self.dtr_id} - {self.employee.name} ({self.date})'
