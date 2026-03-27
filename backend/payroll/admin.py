from django.contrib import admin
from .models import Employee, PayrollRecord


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'name', 'position', 'daily_rate', 'employment_type', 'team_id']
    list_filter = ['employment_type', 'team_id']
    search_fields = ['name', 'employee_id', 'position']


@admin.register(PayrollRecord)
class PayrollRecordAdmin(admin.ModelAdmin):
    list_display = ['payroll_id', 'employee', 'period', 'days_worked', 'gross_pay', 'deductions', 'net_pay', 'status', 'created_date']
    list_filter = ['status', 'period']
    search_fields = ['payroll_id', 'employee__name']
    list_editable = ['status']
