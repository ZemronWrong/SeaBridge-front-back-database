from datetime import date

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManageDTR
from payroll.models import Employee
from .models import DTRRecord
from .serializers import DTRRecordSerializer, ClockInSerializer, ClockOutSerializer


class DTRRecordViewSet(viewsets.ModelViewSet):
    """
    DTR records with role-based filtering.
    - owner/finance: all records
    - manager: team records
    - worker/foreman: own records only

    Custom actions:
    POST /api/dtr/clock-in/   — clock in for today
    POST /api/dtr/clock-out/  — clock out for today
    """
    queryset = DTRRecord.objects.select_related('employee').all()
    serializer_class = DTRRecordSerializer
    permission_classes = [CanManageDTR]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role in ('owner', 'finance'):
            pass  # see all
        elif user.role == 'manager':
            if user.team_id:
                qs = qs.filter(team_id=user.team_id)
            else:
                qs = qs.none()
        elif user.role in ('worker', 'foreman'):
            if user.employee_id:
                qs = qs.filter(employee__employee_id=user.employee_id)
            else:
                qs = qs.none()
        else:
            qs = qs.none()

        # Date filters
        date_filter = self.request.query_params.get('date', '')
        period = self.request.query_params.get('period', '')

        if date_filter:
            qs = qs.filter(date=date_filter)
        elif period == 'today':
            qs = qs.filter(date=date.today())

        return qs

    @action(detail=False, methods=['post'], url_path='clock-in')
    def clock_in(self, request):
        """Clock in for today."""
        user = request.user
        if not user.employee_id:
            return Response(
                {'error': 'No employee record linked to this user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            employee = Employee.objects.get(employee_id=user.employee_id)
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employee record not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        today = date.today()
        if DTRRecord.objects.filter(employee=employee, date=today).exists():
            return Response(
                {'error': 'Already clocked in for today.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ClockInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_dtr = DTRRecord.objects.order_by('-id').first()
        next_num = (last_dtr.id + 1) if last_dtr else 1
        dtr_id = f'DTR-{next_num:03d}'

        record = DTRRecord.objects.create(
            dtr_id=dtr_id,
            employee=employee,
            team_id=employee.team_id,
            date=today,
            time_in=serializer.validated_data['time_in'],
            status='Present',
        )

        return Response(DTRRecordSerializer(record).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='clock-out')
    def clock_out(self, request):
        """Clock out for today."""
        user = request.user
        if not user.employee_id:
            return Response(
                {'error': 'No employee record linked to this user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            employee = Employee.objects.get(employee_id=user.employee_id)
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employee record not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        today = date.today()
        try:
            record = DTRRecord.objects.get(employee=employee, date=today)
        except DTRRecord.DoesNotExist:
            return Response(
                {'error': 'No clock-in record found for today.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ClockOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        record.time_out = serializer.validated_data['time_out']
        record.break_minutes = serializer.validated_data['break_minutes']
        record.overtime_hours = serializer.validated_data['overtime_hours']
        record.save()

        return Response(DTRRecordSerializer(record).data)
