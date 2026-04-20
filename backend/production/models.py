from django.db import models


class Project(models.Model):

    class PaymentStatus(models.TextChoices):
        AWAITING_DP = 'Awaiting DP', 'Awaiting Down Payment'
        DP_RECEIVED = 'DP Received', 'Down Payment Received'
        FULLY_PAID = 'Fully Paid', 'Fully Paid'

    project_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    customer = models.ForeignKey('sales.Customer', on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    progress = models.IntegerField(default=0)
    status = models.CharField(max_length=30, default='Started')
    deadline = models.DateField()
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.AWAITING_DP)

    class Meta:
        ordering = ['project_id']

    def __str__(self):
        return f'{self.project_id} - {self.name}'


class Task(models.Model):

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        IN_PROGRESS = 'In Progress', 'In Progress'
        COMPLETED = 'Completed', 'Completed'

    class DeadlineFlag(models.TextChoices):
        ON_TRACK = 'On Track', 'On Track'
        WARNING = 'Warning', 'Warning'
        REVIEW = 'Review', 'Performance Review'
        DISCIPLINARY = 'Disciplinary', 'Disciplinary Action'

    task_id = models.CharField(max_length=20, unique=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    task_name = models.CharField(max_length=200)
    assigned_to = models.CharField(max_length=100)
    assigned_by = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    deadline = models.DateField()
    created_date = models.DateField(auto_now_add=True)
    description = models.TextField(blank=True, default='')

    deadline_flag = models.CharField(max_length=20, choices=DeadlineFlag.choices, default=DeadlineFlag.ON_TRACK)
    missed_deadline_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_date', 'task_id']

    def __str__(self):
        return f'{self.task_id} - {self.task_name}'


class QualityCheck(models.Model):

    class Result(models.TextChoices):
        PASS = 'Pass', 'Pass'
        FAIL = 'Fail', 'Fail'

    qc_id = models.CharField(max_length=20, unique=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='quality_checks')
    inspection_item = models.CharField(max_length=200)
    inspector = models.CharField(max_length=100)
    result = models.CharField(max_length=10, choices=Result.choices, default=Result.PASS)
    notes = models.TextField(blank=True, default='')
    date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'qc_id']

    def __str__(self):
        return f'{self.qc_id} - {self.inspection_item} ({self.result})'
