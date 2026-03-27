from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManagePayroll
from .models import Employee, PayrollRecord
from .serializers import (
    EmployeeSerializer,
    PayrollRecordSerializer,
    PayrollCreateSerializer,
    PayrollStatusUpdateSerializer,
)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    CRUD for employees.
    GET  /api/employees/
    POST /api/employees/
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [CanManagePayroll]


class PayrollRecordViewSet(viewsets.ModelViewSet):
    """
    Payroll records with role-based filtering.
    - owner/finance: see all records
    - manager: see records for their team
    - worker/foreman: see only own records
    """
    queryset = PayrollRecord.objects.select_related('employee').all()
    serializer_class = PayrollRecordSerializer
    permission_classes = [CanManagePayroll]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role in ('owner', 'finance'):
            pass  # see all
        elif user.role == 'manager':
            if user.team_id:
                qs = qs.filter(employee__team_id=user.team_id)
            else:
                qs = qs.none()
        elif user.role in ('worker', 'foreman'):
            if user.employee_id:
                qs = qs.filter(employee__employee_id=user.employee_id)
            else:
                qs = qs.none()
        else:
            qs = qs.none()

        # Optional period filter
        period = self.request.query_params.get('period', '')
        if period and period != 'all':
            qs = qs.filter(period=period)

        return qs

    def create(self, request, *args, **kwargs):
        """Create payroll with auto-calculation."""
        serializer = PayrollCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            employee = Employee.objects.get(employee_id=data['employee_id'])
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employee not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        gross_pay = data['days_worked'] * employee.daily_rate
        deductions = (gross_pay * Decimal('0.10')).quantize(Decimal('0.01'))
        net_pay = gross_pay - deductions

        last_record = PayrollRecord.objects.order_by('-id').first()
        next_num = (last_record.id + 1) if last_record else 1
        payroll_id = f'PAY-{next_num:03d}'

        record = PayrollRecord.objects.create(
            payroll_id=payroll_id,
            employee=employee,
            period=data['period'],
            days_worked=data['days_worked'],
            daily_rate=employee.daily_rate,
            gross_pay=gross_pay,
            deductions=deductions,
            net_pay=net_pay,
        )

        return Response(
            PayrollRecordSerializer(record).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update payroll record status (Pending → Processed → Paid)."""
        record = self.get_object()
        serializer = PayrollStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record.status = serializer.validated_data['status']
        record.save()
        return Response(PayrollRecordSerializer(record).data)
