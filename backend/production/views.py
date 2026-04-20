import django_filters
from datetime import date

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManageProduction
from . import services
from .models import Project, Task, QualityCheck
from .serializers import (
    ProjectSerializer,
    TaskSerializer,
    TaskStatusUpdateSerializer,
    QualityCheckSerializer,
)


class TaskFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Task.Status.choices)
    assigned_to = django_filters.CharFilter(lookup_expr='icontains')
    assigned_by = django_filters.CharFilter(lookup_expr='icontains')
    project = django_filters.NumberFilter(field_name='project__id')
    project_name = django_filters.CharFilter(field_name='project__name', lookup_expr='icontains')
    task_name = django_filters.CharFilter(field_name='task_name', lookup_expr='icontains')
    deadline_from = django_filters.DateFilter(field_name='deadline', lookup_expr='gte')
    deadline_to = django_filters.DateFilter(field_name='deadline', lookup_expr='lte')
    created_from = django_filters.DateFilter(field_name='created_date', lookup_expr='gte')
    created_to = django_filters.DateFilter(field_name='created_date', lookup_expr='lte')
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    deadline_flag = django_filters.CharFilter()

    class Meta:
        model = Task
        fields = []

    def filter_overdue(self, queryset, name, value):
        if value:
            return queryset.filter(deadline__lt=date.today()).exclude(status='Completed')
        return queryset


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [CanManageProduction]


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related('project').all()
    serializer_class = TaskSerializer
    permission_classes = [CanManageProduction]
    filterset_class = TaskFilter

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if user.role == 'worker':
            name_to_match = user.get_full_name()
            if not name_to_match and user.employee_id:
                from payroll.models import Employee
                try:
                    name_to_match = Employee.objects.get(employee_id=user.employee_id).name
                except Employee.DoesNotExist:
                    name_to_match = user.username
            qs = qs.filter(assigned_to=name_to_match) if name_to_match else qs.none()

        return qs

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if project and not services.can_start_production(project):
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Cannot assign tasks until down payment is received.')

        last_task = Task.objects.order_by('-id').first()
        next_num = (last_task.id + 1) if last_task else 1
        task_id = f'TSK-{next_num:03d}'
        assigned_by = self.request.user.get_full_name() or self.request.user.role.capitalize()
        serializer.save(task_id=task_id, assigned_by=assigned_by)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        task = self.get_object()
        serializer = TaskStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task.status = serializer.validated_data['status']
        task.save()
        return Response(TaskSerializer(task).data)


class QualityCheckViewSet(viewsets.ModelViewSet):
    queryset = QualityCheck.objects.select_related('project').all()
    serializer_class = QualityCheckSerializer
    permission_classes = [CanManageProduction]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == 'worker':
            return qs.none()
        return qs

    def perform_create(self, serializer):
        last_qc = QualityCheck.objects.order_by('-id').first()
        next_num = (last_qc.id + 1) if last_qc else 1
        qc_id = f'QC-{next_num:03d}'
        inspector = self.request.user.get_full_name() or self.request.user.role.capitalize()
        serializer.save(qc_id=qc_id, inspector=inspector)
