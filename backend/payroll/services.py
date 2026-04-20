from decimal import Decimal
from django.db.models import Sum
from .models import Employee, EmployeePayrollProfile, PayrollRun, Deduction
from dtr.models import DTRRecord


def calculate_payroll(employee, start_date, end_date, generated_by=None):
    """
    Build a payroll run from DTR records for the given period.
    Pulls hours, applies statutory deductions from the employee's payroll profile,
    and creates a draft PayrollRun for approval.
    """
    dtr_records = DTRRecord.objects.filter(
        employee=employee,
        date__gte=start_date,
        date__lte=end_date,
        status='Present',
    )

    total_hours = Decimal('0')
    overtime_hours = Decimal('0')
    for record in dtr_records:
        if record.time_in != '-' and record.time_out != '-':
            try:
                t_in = _parse_time(record.time_in)
                t_out = _parse_time(record.time_out)
                worked = (t_out - t_in) / 60 - record.break_minutes / 60
                total_hours += Decimal(str(max(0, worked)))
            except (ValueError, TypeError):
                total_hours += Decimal('8')
        overtime_hours += Decimal(str(record.overtime_hours))

    profile = getattr(employee, 'payroll_profile', None)

    if profile and profile.pay_type == 'monthly':
        gross_pay = profile.monthly_salary
    elif profile and profile.hourly_rate > 0:
        regular_rate = profile.hourly_rate
        ot_rate = regular_rate * Decimal('1.25')
        gross_pay = (total_hours * regular_rate) + (overtime_hours * ot_rate)
    else:
        days_worked = dtr_records.count()
        gross_pay = days_worked * employee.daily_rate

    gross_pay = gross_pay.quantize(Decimal('0.01'))

    last_run = PayrollRun.objects.order_by('-id').first()
    next_num = (last_run.id + 1) if last_run else 1
    payroll_id = f'PR-{next_num:04d}'

    payroll_run = PayrollRun.objects.create(
        payroll_id=payroll_id,
        employee=employee,
        pay_period_start=start_date,
        pay_period_end=end_date,
        total_hours=total_hours,
        overtime_hours=overtime_hours,
        gross_pay=gross_pay,
        generated_by=generated_by,
        status='Draft',
    )

    total_deductions = Decimal('0')

    if profile:
        statutory = [
            ('sss', profile.sss_contribution),
            ('philhealth', profile.philhealth_contribution),
            ('pagibig', profile.pagibig_contribution),
        ]
        for reason, amount in statutory:
            if amount > 0:
                Deduction.objects.create(
                    payroll_run=payroll_run,
                    reason=reason,
                    amount=amount,
                )
                total_deductions += amount

    payroll_run.total_deductions = total_deductions
    payroll_run.net_pay = (gross_pay - total_deductions).quantize(Decimal('0.01'))
    payroll_run.save()

    return payroll_run


def approve_payroll(payroll_run_id, approver_user):
    try:
        run = PayrollRun.objects.get(id=payroll_run_id)
    except PayrollRun.DoesNotExist:
        raise ValueError('Payroll run not found.')

    if approver_user.role not in ('owner', 'finance'):
        raise PermissionError('Only owners or finance can approve payroll.')

    pending_deductions = run.deductions.filter(requires_approval=True, approved=False)
    if pending_deductions.exists():
        raise ValueError('All deductions must be approved before approving the payroll run.')

    run.status = 'Approved'
    run.save()
    return run


def approve_deduction(deduction_id, approver_user):
    try:
        deduction = Deduction.objects.get(id=deduction_id)
    except Deduction.DoesNotExist:
        raise ValueError('Deduction not found.')

    if approver_user.role != 'owner':
        raise PermissionError('Only the owner can approve deductions.')

    deduction.approved = True
    deduction.approved_by = approver_user
    deduction.save()
    return deduction


def get_team_payroll(manager_user, period_start, period_end):
    if not manager_user.team_id:
        return PayrollRun.objects.none()
    return PayrollRun.objects.filter(
        employee__team_id=manager_user.team_id,
        pay_period_start__gte=period_start,
        pay_period_end__lte=period_end,
    ).select_related('employee')


def _parse_time(time_str):
    """Parse HH:MM string to total minutes."""
    parts = time_str.split(':')
    return int(parts[0]) * 60 + int(parts[1])
