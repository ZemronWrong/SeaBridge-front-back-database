from django.db import models
from payroll.models import Employee


class DTRRecord(models.Model):
    """
    Daily Time Record.
    Mirrors the frontend's DTRRecord interface in DTRModule.tsx.
    """

    class Status(models.TextChoices):
        PRESENT = 'Present', 'Present'
        ABSENT = 'Absent', 'Absent'
        ON_LEAVE = 'On Leave', 'On Leave'

    dtr_id = models.CharField(max_length=20, unique=True, verbose_name='DTR ID')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='dtr_records')
    team_id = models.CharField(max_length=20, default='TEAM-A')
    date = models.DateField()
    time_in = models.CharField(max_length=10, default='-')
    time_out = models.CharField(max_length=10, default='-')
    break_minutes = models.IntegerField(default=0)
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PRESENT)

    class Meta:
        ordering = ['-date', 'dtr_id']
        verbose_name = 'DTR Record'
        verbose_name_plural = 'DTR Records'
        unique_together = ['employee', 'date']

    def __str__(self):
        return f'{self.dtr_id} - {self.employee.name} ({self.date})'
