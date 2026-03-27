from django.db import models
from django.conf import settings


class Project(models.Model):
    """
    Boat-building project.
    Mirrors the frontend's activeProjects data in Dashboard.tsx.
    """
    project_id = models.CharField(max_length=20, unique=True, verbose_name='Project ID')
    name = models.CharField(max_length=200)
    progress = models.IntegerField(default=0, help_text='Progress percentage 0-100')
    status = models.CharField(max_length=30, default='Started')
    deadline = models.DateField()

    class Meta:
        ordering = ['project_id']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return f'{self.project_id} - {self.name}'


class Task(models.Model):
    """
    Worker task assignment within a project.
    Mirrors the frontend's Task interface in ProductionModule.tsx.
    """

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        IN_PROGRESS = 'In Progress', 'In Progress'
        COMPLETED = 'Completed', 'Completed'

    task_id = models.CharField(max_length=20, unique=True, verbose_name='Task ID')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    task_name = models.CharField(max_length=200)
    assigned_to = models.CharField(max_length=100, help_text='Worker name')
    assigned_by = models.CharField(max_length=100, help_text='Role/name of assigner')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    deadline = models.DateField()
    created_date = models.DateField(auto_now_add=True)
    description = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-created_date', 'task_id']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return f'{self.task_id} - {self.task_name}'


class QualityCheck(models.Model):
    """
    Quality control inspection record.
    Mirrors the frontend's QualityCheck interface in ProductionModule.tsx.
    """

    class Result(models.TextChoices):
        PASS = 'Pass', 'Pass'
        FAIL = 'Fail', 'Fail'

    qc_id = models.CharField(max_length=20, unique=True, verbose_name='QC ID')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='quality_checks')
    inspection_item = models.CharField(max_length=200)
    inspector = models.CharField(max_length=100)
    result = models.CharField(max_length=10, choices=Result.choices, default=Result.PASS)
    notes = models.TextField(blank=True, default='')
    date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'qc_id']
        verbose_name = 'Quality Check'
        verbose_name_plural = 'Quality Checks'

    def __str__(self):
        return f'{self.qc_id} - {self.inspection_item} ({self.result})'
