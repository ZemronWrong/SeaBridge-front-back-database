import os
import django
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'seabridge.settings')
django.setup()

from accounts.models import CustomUser
from sales.models import Customer, Invoice
from production.models import Project, Task, QualityCheck
from payroll.models import Employee, PayrollRecord, EmployeePayrollProfile, PayrollRun, Deduction
from inventory.models import Material, Supplier, MaterialRequest, PurchaseOrder, PurchaseOrderItem, LowStockAlert
from notifications.models import Notification
from dtr.models import DTRRecord


def wipe_and_seed():
    print('Wiping existing data...')
    Invoice.objects.all().delete()
    Customer.objects.all().delete()
    QualityCheck.objects.all().delete()
    Task.objects.all().delete()
    Project.objects.all().delete()
    Deduction.objects.all().delete()
    PayrollRun.objects.all().delete()
    PayrollRecord.objects.all().delete()
    EmployeePayrollProfile.objects.all().delete()
    DTRRecord.objects.all().delete()
    Employee.objects.all().delete()
    PurchaseOrderItem.objects.all().delete()
    PurchaseOrder.objects.all().delete()
    MaterialRequest.objects.all().delete()
    LowStockAlert.objects.all().delete()
    Material.objects.all().delete()
    Supplier.objects.all().delete()
    Notification.objects.all().delete()
    CustomUser.objects.all().delete()

    print('Creating user accounts...')

    users = {}

    users['carlos'] = CustomUser.objects.create_user(
        username='carlos.santos', password='carlos123',
        first_name='Carlos', last_name='Santos',
        role='owner', employee_id='EMP-001', team_id='MGMT'
    )
    users['maria'] = CustomUser.objects.create_user(
        username='maria.cruz', password='maria123',
        first_name='Maria', last_name='Cruz',
        role='finance', employee_id='EMP-002', team_id='MGMT'
    )
    users['jose'] = CustomUser.objects.create_user(
        username='jose.garcia', password='jose123',
        first_name='Jose', last_name='Garcia',
        role='manager', employee_id='EMP-003', team_id='TEAM-A'
    )
    users['pedro'] = CustomUser.objects.create_user(
        username='pedro.reyes', password='pedro123',
        first_name='Pedro', last_name='Reyes',
        role='manager', employee_id='EMP-004', team_id='TEAM-B'
    )
    users['ramon'] = CustomUser.objects.create_user(
        username='ramon.delacruz', password='ramon123',
        first_name='Ramon', last_name='Dela Cruz',
        role='foreman', employee_id='EMP-010', team_id='TEAM-A'
    )
    users['juan'] = CustomUser.objects.create_user(
        username='juan.reyes', password='juan123',
        first_name='Juan', last_name='Reyes',
        role='worker', employee_id='EMP-005', team_id='TEAM-A'
    )
    users['miguel'] = CustomUser.objects.create_user(
        username='miguel.torres', password='miguel123',
        first_name='Miguel', last_name='Torres',
        role='worker', employee_id='EMP-006', team_id='TEAM-A'
    )
    users['antonio'] = CustomUser.objects.create_user(
        username='antonio.ramos', password='antonio123',
        first_name='Antonio', last_name='Ramos',
        role='worker', employee_id='EMP-007', team_id='TEAM-B'
    )
    users['rafael'] = CustomUser.objects.create_user(
        username='rafael.lim', password='rafael123',
        first_name='Rafael', last_name='Lim',
        role='worker', employee_id='EMP-008', team_id='TEAM-B'
    )
    users['diego'] = CustomUser.objects.create_user(
        username='diego.villanueva', password='diego123',
        first_name='Diego', last_name='Villanueva',
        role='worker', employee_id='EMP-009', team_id='TEAM-A'
    )

    print('10 user accounts created.')

    employees = {}
    emp_data = [
        ('EMP-001', 'Carlos Santos',    'CEO / Owner',        2500, 'Regular',     'MGMT'),
        ('EMP-002', 'Maria Cruz',       'Finance Officer',    1800, 'Regular',     'MGMT'),
        ('EMP-003', 'Jose Garcia',      'Production Manager', 2000, 'Regular',     'TEAM-A'),
        ('EMP-004', 'Pedro Reyes',      'Floor Manager',      2000, 'Regular',     'TEAM-B'),
        ('EMP-005', 'Juan Reyes',       'Senior Shipwright',  1500, 'Regular',     'TEAM-A'),
        ('EMP-006', 'Miguel Torres',    'Hull Fabricator',    1400, 'Regular',     'TEAM-A'),
        ('EMP-007', 'Antonio Ramos',    'Welder',             1300, 'Contractual', 'TEAM-B'),
        ('EMP-008', 'Rafael Lim',       'Marine Electrician', 1600, 'Regular',     'TEAM-B'),
        ('EMP-009', 'Diego Villanueva', 'Painter / Finisher', 1200, 'Contractual', 'TEAM-A'),
        ('EMP-010', 'Ramon Dela Cruz',  'Site Foreman',       1800, 'Regular',     'TEAM-A'),
    ]
    for eid, name, position, rate, etype, team in emp_data:
        employees[eid] = Employee.objects.create(
            employee_id=eid, name=name, position=position,
            daily_rate=Decimal(str(rate)), employment_type=etype, team_id=team,
        )

    print('10 employee records created.')

    for eid, emp in employees.items():
        hourly = (emp.daily_rate / Decimal('8')).quantize(Decimal('0.01'))
        EmployeePayrollProfile.objects.create(
            employee=emp,
            hourly_rate=hourly,
            monthly_salary=emp.daily_rate * 22,
            sss_contribution=Decimal('500.00'),
            philhealth_contribution=Decimal('300.00'),
            pagibig_contribution=Decimal('200.00'),
            pay_type='hourly',
        )

    print('10 payroll profiles created.')

    sup1 = Supplier.objects.create(name='Oceanic Timber Co.', contact_person='John Doe', email='john@oceanic.com', phone='555-0101', address='123 Port Road')
    sup2 = Supplier.objects.create(name='MarineTech Electronics', contact_person='Jane Smith', email='jane@marinetech.com', phone='555-0202', address='456 Harbor Blvd')
    sup3 = Supplier.objects.create(name='Global Resins Ltd', contact_person='Bob Lee', email='bob@globalresins.com', phone='555-0303', address='789 Industrial Pkwy')

    m1 = Material.objects.create(
        material_id='MAT-001', name='Marine Plywood (Grade A)', category='Wood',
        quantity=120, unit='sheets', min_stock=50, unit_price=Decimal('120.00'),
        supplier=sup1, lead_time_days=5, avg_daily_usage=Decimal('3.0'),
    )
    m2 = Material.objects.create(
        material_id='MAT-002', name='Teak Wood Planks', category='Wood',
        quantity=45, unit='planks', min_stock=20, unit_price=Decimal('250.00'),
        supplier=sup1, lead_time_days=7, avg_daily_usage=Decimal('1.5'),
    )
    m3 = Material.objects.create(
        material_id='MAT-003', name='Fiberglass Resin', category='Chemical',
        quantity=15, unit='gallons', min_stock=30, unit_price=Decimal('85.00'),
        supplier=sup3, lead_time_days=10, avg_daily_usage=Decimal('2.0'),
        description='Polyester-based fiberglass resin for hull layup',
    )
    m4 = Material.objects.create(
        material_id='MAT-004', name='Navigation Radar System', category='Electronic',
        quantity=8, unit='units', min_stock=5, unit_price=Decimal('4500.00'),
        supplier=sup2, lead_time_days=14, avg_daily_usage=Decimal('0.2'),
    )
    m5 = Material.objects.create(
        material_id='MAT-005', name='VHF Marine Radio', category='Electronic',
        quantity=4, unit='units', min_stock=10, unit_price=Decimal('300.00'),
        supplier=sup2, lead_time_days=7, avg_daily_usage=Decimal('0.5'),
    )

    MaterialRequest.objects.create(material=m3, quantity=25, status='Pending', requester=users['juan'])
    po = PurchaseOrder.objects.create(po_number='PO-2026-001', supplier=sup2, status='Sent', expected_delivery=(timezone.now() + timedelta(days=7)).date())
    PurchaseOrderItem.objects.create(purchase_order=po, material=m5, quantity=10, unit_price=Decimal('300.00'))

    c1 = Customer.objects.create(name='Azure Marine Group', email='purchasing@azuremarine.com', phone='555-1111', company='Azure Marine', address='100 Ocean View')
    c2 = Customer.objects.create(name='Private Buyer: E. Musk', email='elon@private.com', phone='555-2222', company='N/A', address='Boca Chica')
    c3 = Customer.objects.create(name='Coastal Security Services', email='procurement@coastal.gov', phone='555-3333', company='Gov', address='Navy Pier')

    p1 = Project.objects.create(project_id='PRJ-001', name='Luxury Yacht X-Class', customer=c1, progress=45, status='In Progress', deadline=(timezone.now() + timedelta(days=60)).date(), payment_status='DP Received')
    p2 = Project.objects.create(project_id='PRJ-002', name='Speedboat V-2', customer=c2, progress=15, status='In Progress', deadline=(timezone.now() + timedelta(days=20)).date(), payment_status='DP Received')
    p3 = Project.objects.create(project_id='PRJ-003', name='Fishing Trawler M1', customer=c3, progress=0, status='Scheduled', deadline=(timezone.now() + timedelta(days=90)).date(), payment_status='Awaiting DP')

    Task.objects.create(task_id='TSK-001', project=p1, task_name='Hull Fiberglass Layup', assigned_to='Juan Reyes', assigned_by='Jose Garcia', status='Completed', deadline=(timezone.now() - timedelta(days=15)).date())
    Task.objects.create(task_id='TSK-002', project=p1, task_name='Engine Installation', assigned_to='Miguel Torres', assigned_by='Jose Garcia', status='In Progress', deadline=(timezone.now() + timedelta(days=5)).date())
    Task.objects.create(task_id='TSK-003', project=p2, task_name='Frame Assembly', assigned_to='Antonio Ramos', assigned_by='Pedro Reyes', status='Pending', deadline=(timezone.now() + timedelta(days=10)).date())
    Task.objects.create(task_id='TSK-004', project=p1, task_name='Electrical Wiring', assigned_to='Rafael Lim', assigned_by='Jose Garcia', status='In Progress', deadline=(timezone.now() + timedelta(days=8)).date())
    Task.objects.create(task_id='TSK-005', project=p2, task_name='Interior Painting', assigned_to='Diego Villanueva', assigned_by='Pedro Reyes', status='Pending', deadline=(timezone.now() + timedelta(days=15)).date())

    QualityCheck.objects.create(qc_id='QC-001', project=p1, inspection_item='Hull Integrity Scan', inspector='Carlos Santos', result='Pass', notes='Hull integration looks solid.')

    Invoice.objects.create(invoice_number='INV-2026-001', customer=c1, project=p1, amount_due=Decimal('450000.00'), status='Paid', due_date=(timezone.now() - timedelta(days=5)).date())
    Invoice.objects.create(invoice_number='INV-2026-002', customer=c3, project=p3, amount_due=Decimal('120000.00'), status='Sent', due_date=(timezone.now() + timedelta(days=15)).date())

    Notification.objects.create(user=users['carlos'], title='Low Stock Alert', message='Fiberglass Resin is below reorder point.', notification_type='warning')
    Notification.objects.create(user=users['carlos'], title='Quality Check Passed', message='Hull Fiberglass Layup passed QC inspection.', notification_type='success')
    Notification.objects.create(user=users['carlos'], title='New Invoice Paid', message='Invoice INV-2026-001 has been settled.', notification_type='info')

    for eid, emp in employees.items():
        PayrollRecord.objects.create(
            payroll_id=f'PAY-{eid.split("-")[1]}',
            employee=emp, period='2026-03',
            days_worked=20, daily_rate=emp.daily_rate,
            gross_pay=emp.daily_rate * 20,
            deductions=emp.daily_rate * 20 * Decimal('0.08'),
            net_pay=emp.daily_rate * 20 * Decimal('0.92'),
            status='Processed',
        )

    print('All seed data created.')

    print('\n' + '=' * 60)
    print('  USER ACCOUNTS')
    print('=' * 60)
    print(f"{'USERNAME':<22} {'PASSWORD':<15} {'ROLE':<10} {'NAME'}")
    print('-' * 60)
    acct_list = [
        ('carlos.santos',    'carlos123',  'owner',   'Carlos Santos'),
        ('maria.cruz',       'maria123',   'finance', 'Maria Cruz'),
        ('jose.garcia',      'jose123',    'manager', 'Jose Garcia'),
        ('pedro.reyes',      'pedro123',   'manager', 'Pedro Reyes'),
        ('ramon.delacruz',   'ramon123',   'foreman', 'Ramon Dela Cruz'),
        ('juan.reyes',       'juan123',    'worker',  'Juan Reyes'),
        ('miguel.torres',    'miguel123',  'worker',  'Miguel Torres'),
        ('antonio.ramos',    'antonio123', 'worker',  'Antonio Ramos'),
        ('rafael.lim',       'rafael123',  'worker',  'Rafael Lim'),
        ('diego.villanueva', 'diego123',   'worker',  'Diego Villanueva'),
    ]
    for uname, pwd, role, name in acct_list:
        print(f"{uname:<22} {pwd:<15} {role:<10} {name}")
    print('=' * 60)
    print('\nSeeding complete.')


if __name__ == '__main__':
    wipe_and_seed()
