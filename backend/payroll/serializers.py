from rest_framework import serializers
from .models import Employee, PayrollRecord


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'name', 'position',
            'daily_rate', 'employment_type', 'team_id',
        ]
        read_only_fields = ['id']


class PayrollRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    position = serializers.CharField(source='employee.position', read_only=True)

    class Meta:
        model = PayrollRecord
        fields = [
            'id', 'payroll_id', 'employee', 'employee_name', 'position',
            'period', 'days_worked', 'daily_rate', 'gross_pay',
            'deductions', 'net_pay', 'status', 'created_date',
        ]
        read_only_fields = ['id', 'payroll_id', 'gross_pay', 'deductions', 'net_pay', 'created_date']


class PayrollCreateSerializer(serializers.Serializer):
    """Simplified payroll creation — auto-calculates pay from employee rate."""
    employee_id = serializers.CharField()
    period = serializers.CharField(max_length=7)
    days_worked = serializers.IntegerField(min_value=0)


class PayrollStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=PayrollRecord.Status.choices)
