from datetime import date
from django.conf import settings
from payroll.models import Employee
from .models import DTRRecord


def get_employee_for_user(user):
    if not user.employee_id:
        return None
    try:
        return Employee.objects.get(employee_id=user.employee_id)
    except Employee.DoesNotExist:
        return None


def clock_in(user, time_in='08:00'):
    employee = get_employee_for_user(user)
    if not employee:
        raise ValueError('No employee record linked to this user.')

    today = date.today()
    if DTRRecord.objects.filter(employee=employee, date=today).exists():
        raise ValueError('Already clocked in for today.')

    last_dtr = DTRRecord.objects.order_by('-id').first()
    next_num = (last_dtr.id + 1) if last_dtr else 1
    dtr_id = f'DTR-{next_num:03d}'

    return DTRRecord.objects.create(
        dtr_id=dtr_id,
        employee=employee,
        team_id=employee.team_id,
        date=today,
        time_in=time_in,
        status='Present',
    )


def clock_out(user, time_out='17:00', break_minutes=60, overtime_hours=0):
    employee = get_employee_for_user(user)
    if not employee:
        raise ValueError('No employee record linked to this user.')

    today = date.today()
    try:
        record = DTRRecord.objects.get(employee=employee, date=today)
    except DTRRecord.DoesNotExist:
        raise ValueError('No clock-in record found for today.')

    record.time_out = time_out
    record.break_minutes = break_minutes
    record.overtime_hours = overtime_hours
    record.save()
    return record


def auto_clockout_all():
    """
    Automatically clock out all employees who forgot to clock out today.
    Only runs if AUTO_TIMEOUT_ENABLED is True in settings.
    All auto-timeouts are flagged for HR review.
    """
    if not getattr(settings, 'AUTO_TIMEOUT_ENABLED', False):
        return []

    timeout_time = getattr(settings, 'AUTO_TIMEOUT_TIME', '23:59')
    today = date.today()

    open_records = DTRRecord.objects.filter(
        date=today,
        time_out='-',
        auto_clocked_out=False,
    )

    flagged = []
    for record in open_records:
        record.time_out = timeout_time
        record.auto_clocked_out = True
        record.requires_adjustment = True
        record.save()
        flagged.append(record)

    return flagged


def approve_adjustment(record_id, supervisor_user, note=''):
    """Supervisor approves a time correction on an auto-flagged record."""
    try:
        record = DTRRecord.objects.get(id=record_id)
    except DTRRecord.DoesNotExist:
        raise ValueError('DTR record not found.')

    if supervisor_user.role not in ('owner', 'manager'):
        raise PermissionError('Only owners or managers can approve adjustments.')

    record.requires_adjustment = False
    record.adjustment_approved_by = supervisor_user
    record.adjustment_note = note
    record.save()
    return record
