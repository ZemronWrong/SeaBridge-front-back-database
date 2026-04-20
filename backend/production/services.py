from datetime import date
from decimal import Decimal
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Project, Task
from notifications.models import Notification

User = get_user_model()


def can_start_production(project):
    return project.payment_status in ('DP Received', 'Fully Paid')


def check_deadline_violations():
    """
    Scan overdue tasks and apply the configured penalty policy.
    Progressive discipline: 1st → Warning, 2-3 → Review, 4+ → Disciplinary.
    Called daily via management command.
    """
    today = date.today()
    penalty_type = getattr(settings, 'DEADLINE_MISS_PENALTY_TYPE', 'warning_only')

    overdue_tasks = Task.objects.filter(
        deadline__lt=today,
    ).exclude(
        status='Completed',
    ).exclude(
        deadline_flag='Disciplinary',
    )

    flagged = []
    for task in overdue_tasks:
        task.missed_deadline_count += 1
        count = task.missed_deadline_count

        if count == 1:
            task.deadline_flag = 'Warning'
        elif count <= 3:
            task.deadline_flag = 'Review'
        else:
            task.deadline_flag = 'Disciplinary'

        task.save()
        flagged.append(task)

        if penalty_type == 'payroll_deduction':
            _create_deadline_deduction(task)

        _notify_deadline_miss(task)

    return flagged


def _create_deadline_deduction(task):
    """Create a payroll deduction record for a missed deadline (requires owner approval)."""
    from payroll.models import Employee, PayrollRun, Deduction

    try:
        employee = Employee.objects.get(name=task.assigned_to)
    except Employee.DoesNotExist:
        return

    fixed_penalty = getattr(settings, 'DEADLINE_MISS_FIXED_PENALTY', Decimal('0'))
    if fixed_penalty <= 0:
        profile = getattr(employee, 'payroll_profile', None)
        if profile and profile.hourly_rate > 0:
            fixed_penalty = profile.hourly_rate * Decimal('8')
        else:
            fixed_penalty = employee.daily_rate

    latest_run = PayrollRun.objects.filter(employee=employee).order_by('-pay_period_end').first()
    if not latest_run:
        return

    Deduction.objects.create(
        payroll_run=latest_run,
        reason='missed_deadline',
        description=f'Missed deadline: {task.task_name} (due {task.deadline})',
        amount=fixed_penalty,
        requires_approval=True,
    )


def _notify_deadline_miss(task):
    owners = User.objects.filter(role__in=['owner', 'manager'])
    for user in owners:
        Notification.objects.create(
            user=user,
            title=f'Deadline Missed: {task.task_name}',
            message=f'{task.assigned_to} missed deadline for "{task.task_name}" (due {task.deadline}). Flag: {task.deadline_flag}.',
            notification_type='warning',
            link='production',
        )
