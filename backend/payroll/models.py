from django.db import models


class Employee(models.Model):
    """
    Employee record.
    Mirrors the frontend's Employee interface in PayrollModule.tsx.
    """

    class EmploymentType(models.TextChoices):
        REGULAR = 'Regular', 'Regular'
        CONTRACTUAL = 'Contractual', 'Contractual'

    employee_id = models.CharField(max_length=20, unique=True, verbose_name='Employee ID')
    name = models.CharField(max_length=200)
    position = models.CharField(max_length=100)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Daily Rate (₱)')
    employment_type = models.CharField(
        max_length=15,
        choices=EmploymentType.choices,
        default=EmploymentType.REGULAR,
    )
    team_id = models.CharField(max_length=20, default='TEAM-A')

    class Meta:
        ordering = ['employee_id']
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'

    def __str__(self):
        return f'{self.employee_id} - {self.name} ({self.position})'


class PayrollRecord(models.Model):
    """
    Payroll record per employee per period.
    Mirrors the frontend's PayrollRecord interface in PayrollModule.tsx.
    """

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        PROCESSED = 'Processed', 'Processed'
        PAID = 'Paid', 'Paid'

    payroll_id = models.CharField(max_length=20, unique=True, verbose_name='Payroll ID')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payroll_records')
    period = models.CharField(max_length=7, help_text='Format: YYYY-MM')
    days_worked = models.IntegerField(default=0)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    gross_pay = models.DecimalField(max_digits=12, decimal_places=2)
    deductions = models.DecimalField(max_digits=12, decimal_places=2)
    net_pay = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    created_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-period', 'payroll_id']
        verbose_name = 'Payroll Record'
        verbose_name_plural = 'Payroll Records'

    def __str__(self):
        return f'{self.payroll_id} - {self.employee.name} ({self.period})'
