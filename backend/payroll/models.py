from django.db import models
from django.conf import settings


class Employee(models.Model):

    class EmploymentType(models.TextChoices):
        REGULAR = 'Regular', 'Regular'
        CONTRACTUAL = 'Contractual', 'Contractual'

    employee_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    position = models.CharField(max_length=100)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    employment_type = models.CharField(max_length=15, choices=EmploymentType.choices, default=EmploymentType.REGULAR)
    team_id = models.CharField(max_length=20, default='TEAM-A')

    class Meta:
        ordering = ['employee_id']

    def __str__(self):
        return f'{self.employee_id} - {self.name} ({self.position})'


class EmployeePayrollProfile(models.Model):

    class PayType(models.TextChoices):
        HOURLY = 'hourly', 'Hourly'
        MONTHLY = 'monthly', 'Monthly'

    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='payroll_profile')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_exemptions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sss_contribution = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    philhealth_contribution = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pagibig_contribution = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pay_type = models.CharField(max_length=10, choices=PayType.choices, default=PayType.HOURLY)

    def __str__(self):
        return f'Payroll Profile: {self.employee.name}'


class PayrollRecord(models.Model):
    """Legacy payroll record. Kept for backward compatibility."""

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        PROCESSED = 'Processed', 'Processed'
        PAID = 'Paid', 'Paid'

    payroll_id = models.CharField(max_length=20, unique=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payroll_records')
    period = models.CharField(max_length=7)
    days_worked = models.IntegerField(default=0)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    gross_pay = models.DecimalField(max_digits=10, decimal_places=2)
    deductions = models.DecimalField(max_digits=10, decimal_places=2)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    created_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-period', 'payroll_id']

    def __str__(self):
        return f'{self.payroll_id} - {self.employee.name} ({self.period})'


class PayrollRun(models.Model):

    class Status(models.TextChoices):
        DRAFT = 'Draft', 'Draft'
        PENDING_APPROVAL = 'Pending Approval', 'Pending Approval'
        APPROVED = 'Approved', 'Approved'
        PAID = 'Paid', 'Paid'

    payroll_id = models.CharField(max_length=20, unique=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payroll_runs')
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    total_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='generated_payrolls')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-pay_period_end']

    def __str__(self):
        return f'{self.payroll_id} - {self.employee.name} ({self.pay_period_start} to {self.pay_period_end})'


class Deduction(models.Model):

    class Reason(models.TextChoices):
        MISSED_DEADLINE = 'missed_deadline', 'Missed Deadline'
        LATE = 'late', 'Late'
        ADVANCE = 'advance', 'Cash Advance'
        SSS = 'sss', 'SSS'
        PHILHEALTH = 'philhealth', 'PhilHealth'
        PAGIBIG = 'pagibig', 'Pag-IBIG'
        TAX = 'tax', 'Tax'
        OTHER = 'other', 'Other'

    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='deductions')
    reason = models.CharField(max_length=20, choices=Reason.choices)
    description = models.TextField(blank=True, default='')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    requires_approval = models.BooleanField(default=False)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_deductions')
    approved = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.get_reason_display()}: ₱{self.amount}'
