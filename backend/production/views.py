from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import CanManageProduction
from payroll.models import Employee
from .models import Project, Task, QualityCheck
from .serializers import (
    ProjectSerializer,
    TaskSerializer,
    TaskStatusUpdateSerializer,
    QualityCheckSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    CRUD for projects.
    GET  /api/projects/
    POST /api/projects/
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [CanManageProduction]


class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD for tasks.
    Workers only see their own assigned tasks.
    Managers/owners see all tasks.
    POST /api/tasks/<pk>/update-status/ — change task status
    """
    queryset = Task.objects.select_related('project').all()
    serializer_class = TaskSerializer
    permission_classes = [CanManageProduction]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        # Workers only see their own tasks
        if user.role == 'worker':
            # Match by user's full name or associated employee name
            name_to_match = user.get_full_name()
            if not name_to_match and user.employee_id:
                try:
                    name_to_match = Employee.objects.get(employee_id=user.employee_id).name
                except Employee.DoesNotExist:
                    name_to_match = user.username
            
            if name_to_match:
                qs = qs.filter(assigned_to=name_to_match)
            else:
                qs = qs.none()

        return qs

    def perform_create(self, serializer):
        # Auto-generate task_id
        last_task = Task.objects.order_by('-id').first()
        next_num = (last_task.id + 1) if last_task else 1
        task_id = f'TSK-{next_num:03d}'

        assigned_by = self.request.user.get_full_name() or self.request.user.role.capitalize()
        serializer.save(task_id=task_id, assigned_by=assigned_by)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update task status."""
        task = self.get_object()
        serializer = TaskStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task.status = serializer.validated_data['status']
        task.save()
        return Response(TaskSerializer(task).data)


class QualityCheckViewSet(viewsets.ModelViewSet):
    """
    CRUD for quality checks.
    Only owner/foreman can create.
    Owner/manager/foreman can view.
    """
    queryset = QualityCheck.objects.select_related('project').all()
    serializer_class = QualityCheckSerializer
    permission_classes = [CanManageProduction]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Workers cannot view QC records
        if user.role == 'worker':
            return qs.none()
        return qs

    def perform_create(self, serializer):
        # Auto-generate QC ID
        last_qc = QualityCheck.objects.order_by('-id').first()
        next_num = (last_qc.id + 1) if last_qc else 1
        qc_id = f'QC-{next_num:03d}'

        inspector = self.request.user.get_full_name() or self.request.user.role.capitalize()
        serializer.save(qc_id=qc_id, inspector=inspector)
