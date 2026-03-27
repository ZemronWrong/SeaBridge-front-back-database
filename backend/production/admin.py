from django.contrib import admin
from .models import Project, Task, QualityCheck


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['project_id', 'name', 'progress', 'status', 'deadline']
    list_filter = ['status']
    search_fields = ['name', 'project_id']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['task_id', 'task_name', 'project', 'assigned_to', 'status', 'deadline', 'created_date']
    list_filter = ['status', 'project']
    search_fields = ['task_name', 'assigned_to', 'task_id']
    list_editable = ['status']


@admin.register(QualityCheck)
class QualityCheckAdmin(admin.ModelAdmin):
    list_display = ['qc_id', 'project', 'inspection_item', 'inspector', 'result', 'date']
    list_filter = ['result', 'project']
    search_fields = ['inspection_item', 'qc_id']
