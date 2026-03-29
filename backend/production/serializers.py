from rest_framework import serializers
from .models import Project, Task, QualityCheck


class ProjectSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'project_id', 'name', 'customer', 'customer_name', 'progress', 'status', 'deadline']
        read_only_fields = ['id']


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    project_id_display = serializers.CharField(source='project.project_id', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'task_id', 'project', 'project_id_display', 'project_name',
            'task_name', 'assigned_to', 'assigned_by', 'status',
            'deadline', 'created_date', 'description',
        ]
        read_only_fields = ['id', 'task_id', 'created_date']


class TaskStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Task.Status.choices)


class QualityCheckSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    project_id_display = serializers.CharField(source='project.project_id', read_only=True)

    class Meta:
        model = QualityCheck
        fields = [
            'id', 'qc_id', 'project', 'project_id_display', 'project_name',
            'inspection_item', 'inspector', 'result', 'notes', 'date',
        ]
        read_only_fields = ['id', 'qc_id', 'date']
