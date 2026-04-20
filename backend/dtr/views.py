from datetime import date

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManageDTR
from . import services
from .models import DTRRecord
from .serializers import DTRRecordSerializer, ClockInSerializer, ClockOutSerializer


class DTRRecordViewSet(viewsets.ModelViewSet):
    queryset = DTRRecord.objects.select_related('employee').all()
    serializer_class = DTRRecordSerializer
    permission_classes = [CanManageDTR]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role in ('owner', 'finance'):
            pass
        elif user.role == 'manager':
            qs = qs.filter(team_id=user.team_id) if user.team_id else qs.none()
        elif user.role in ('worker', 'foreman'):
            qs = qs.filter(employee__employee_id=user.employee_id) if user.employee_id else qs.none()
        else:
            qs = qs.none()

        date_filter = self.request.query_params.get('date', '')
        period = self.request.query_params.get('period', '')

        if date_filter:
            qs = qs.filter(date=date_filter)
        elif period == 'today':
            qs = qs.filter(date=date.today())

        return qs

    @action(detail=False, methods=['post'], url_path='clock-in')
    def clock_in(self, request):
        serializer = ClockInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            record = services.clock_in(request.user, serializer.validated_data['time_in'])
            return Response(DTRRecordSerializer(record).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='clock-out')
    def clock_out(self, request):
        serializer = ClockOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            record = services.clock_out(
                request.user,
                serializer.validated_data['time_out'],
                serializer.validated_data['break_minutes'],
                serializer.validated_data['overtime_hours'],
            )
            return Response(DTRRecordSerializer(record).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='approve-adjustment')
    def approve_adjustment(self, request, pk=None):
        note = request.data.get('note', '')
        try:
            record = services.approve_adjustment(pk, request.user, note)
            return Response(DTRRecordSerializer(record).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
