from rest_framework import serializers
from .models import Employee, PayrollRecord, EmployeePayrollProfile, PayrollRun, Deduction


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'name', 'position', 'daily_rate', 'employment_type', 'team_id']
        read_only_fields = ['id']


class EmployeePayrollProfileSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)

    class Meta:
        model = EmployeePayrollProfile
        fields = [
            'id', 'employee', 'employee_name',
            'hourly_rate', 'monthly_salary', 'tax_exemptions',
            'sss_contribution', 'philhealth_contribution', 'pagibig_contribution',
            'pay_type',
        ]


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
    employee_id = serializers.CharField()
    period = serializers.CharField(max_length=7)
    days_worked = serializers.IntegerField(min_value=0)


class PayrollStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=PayrollRecord.Status.choices)


class DeductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deduction
        fields = [
            'id', 'payroll_run', 'reason', 'description', 'amount',
            'requires_approval', 'approved_by', 'approved',
        ]
        read_only_fields = ['id']


class PayrollRunSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    deductions_list = DeductionSerializer(source='deductions', many=True, read_only=True)

    class Meta:
        model = PayrollRun
        fields = [
            'id', 'payroll_id', 'employee', 'employee_name',
            'pay_period_start', 'pay_period_end',
            'total_hours', 'overtime_hours',
            'gross_pay', 'total_deductions', 'net_pay',
            'status', 'generated_by', 'created_at',
            'deductions_list',
        ]
        read_only_fields = ['id', 'payroll_id', 'created_at']


class PayrollRunCreateSerializer(serializers.Serializer):
    employee_id = serializers.CharField()
    pay_period_start = serializers.DateField()
    pay_period_end = serializers.DateField()
