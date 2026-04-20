from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManagePayroll, IsOwner
from . import services
from .models import Employee, PayrollRecord, EmployeePayrollProfile, PayrollRun, Deduction
from .serializers import (
    EmployeeSerializer,
    PayrollRecordSerializer,
    PayrollCreateSerializer,
    PayrollStatusUpdateSerializer,
    EmployeePayrollProfileSerializer,
    PayrollRunSerializer,
    PayrollRunCreateSerializer,
    DeductionSerializer,
)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [CanManagePayroll]


class EmployeePayrollProfileViewSet(viewsets.ModelViewSet):
    queryset = EmployeePayrollProfile.objects.select_related('employee').all()
    serializer_class = EmployeePayrollProfileSerializer
    permission_classes = [CanManagePayroll]


class PayrollRecordViewSet(viewsets.ModelViewSet):
    queryset = PayrollRecord.objects.select_related('employee').all()
    serializer_class = PayrollRecordSerializer
    permission_classes = [CanManagePayroll]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role in ('owner', 'finance'):
            pass
        elif user.role == 'manager':
            qs = qs.filter(employee__team_id=user.team_id) if user.team_id else qs.none()
        elif user.role in ('worker', 'foreman'):
            qs = qs.filter(employee__employee_id=user.employee_id) if user.employee_id else qs.none()
        else:
            qs = qs.none()

        period = self.request.query_params.get('period', '')
        if period and period != 'all':
            qs = qs.filter(period=period)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = PayrollCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            employee = Employee.objects.get(employee_id=data['employee_id'])
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

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

        return Response(PayrollRecordSerializer(record).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        record = self.get_object()
        serializer = PayrollStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record.status = serializer.validated_data['status']
        record.save()
        return Response(PayrollRecordSerializer(record).data)


class PayrollRunViewSet(viewsets.ModelViewSet):
    queryset = PayrollRun.objects.select_related('employee').prefetch_related('deductions').all()
    serializer_class = PayrollRunSerializer
    permission_classes = [CanManagePayroll]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role in ('owner', 'finance'):
            pass
        elif user.role == 'manager':
            qs = qs.filter(employee__team_id=user.team_id) if user.team_id else qs.none()
        elif user.role in ('worker', 'foreman'):
            qs = qs.filter(employee__employee_id=user.employee_id) if user.employee_id else qs.none()
        else:
            qs = qs.none()

        return qs

    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        serializer = PayrollRunCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            employee = Employee.objects.get(employee_id=data['employee_id'])
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            run = services.calculate_payroll(
                employee,
                data['pay_period_start'],
                data['pay_period_end'],
                generated_by=request.user,
            )
            return Response(PayrollRunSerializer(run).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        try:
            run = services.approve_payroll(pk, request.user)
            return Response(PayrollRunSerializer(run).data)
        except (ValueError, PermissionError) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DeductionViewSet(viewsets.ModelViewSet):
    queryset = Deduction.objects.select_related('payroll_run__employee').all()
    serializer_class = DeductionSerializer
    permission_classes = [CanManagePayroll]

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        try:
            deduction = services.approve_deduction(pk, request.user)
            return Response(DeductionSerializer(deduction).data)
        except (ValueError, PermissionError) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
