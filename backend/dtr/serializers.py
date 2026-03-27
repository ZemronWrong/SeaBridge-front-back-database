from rest_framework import serializers
from .models import DTRRecord


class DTRRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_id_display = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = DTRRecord
        fields = [
            'id', 'dtr_id', 'employee', 'employee_id_display', 'employee_name',
            'team_id', 'date', 'time_in', 'time_out',
            'break_minutes', 'overtime_hours', 'status',
        ]
        read_only_fields = ['id', 'dtr_id']


class ClockInSerializer(serializers.Serializer):
    """Clock in for the day."""
    time_in = serializers.CharField(max_length=10, default='08:00')


class ClockOutSerializer(serializers.Serializer):
    """Clock out for the day."""
    time_out = serializers.CharField(max_length=10, default='17:00')
    break_minutes = serializers.IntegerField(default=60)
    overtime_hours = serializers.DecimalField(max_digits=4, decimal_places=1, default=0)
