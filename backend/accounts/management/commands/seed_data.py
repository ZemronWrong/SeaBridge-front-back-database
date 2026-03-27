"""
Management command to seed the database with demo data
matching the frontend's hardcoded sample data.

Usage: python manage.py seed_data
"""
from datetime import date
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from inventory.models import Material
from production.models import Project, Task, QualityCheck
from payroll.models import Employee, PayrollRecord
from dtr.models import DTRRecord

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with demo data matching the frontend'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...\n')

        self._create_employees()
        self._create_users()
        self._create_materials()
        self._create_projects()
        self._create_tasks()
        self._create_quality_checks()
        self._create_payroll_records()
        self._create_dtr_records()

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('Demo login accounts:'))
        self.stdout.write('  owner    / owner123')
        self.stdout.write('  manager  / manager123')
        self.stdout.write('  finance  / finance123')
        self.stdout.write('  foreman  / foreman123')
        self.stdout.write('  worker   / worker123')

    def _create_employees(self):
        self.stdout.write('  Creating employees...')
        employees_data = [
            {'employee_id': 'EMP-001', 'name': 'Juan dela Cruz', 'position': 'Senior Welder', 'daily_rate': 850, 'employment_type': 'Regular', 'team_id': 'TEAM-A'},
            {'employee_id': 'EMP-002', 'name': 'Pedro Santos', 'position': 'Engine Technician', 'daily_rate': 900, 'employment_type': 'Regular', 'team_id': 'TEAM-A'},
            {'employee_id': 'EMP-003', 'name': 'Maria Garcia', 'position': 'Carpenter', 'daily_rate': 750, 'employment_type': 'Regular', 'team_id': 'TEAM-A'},
            {'employee_id': 'EMP-004', 'name': 'Jose Reyes', 'position': 'Interior Specialist', 'daily_rate': 800, 'employment_type': 'Contractual', 'team_id': 'TEAM-A'},
            {'employee_id': 'EMP-005', 'name': 'Roberto Cruz', 'position': 'Painter', 'daily_rate': 700, 'employment_type': 'Regular', 'team_id': 'TEAM-B'},
            {'employee_id': 'EMP-006', 'name': 'Ana Lopez', 'position': 'Electrician', 'daily_rate': 820, 'employment_type': 'Regular', 'team_id': 'TEAM-B'},
            {'employee_id': 'EMP-007', 'name': 'Carlos Mendoza', 'position': 'Fiberglass Worker', 'daily_rate': 780, 'employment_type': 'Contractual', 'team_id': 'TEAM-B'},
        ]
        for data in employees_data:
            Employee.objects.get_or_create(
                employee_id=data['employee_id'],
                defaults=data,
            )

    def _create_users(self):
        self.stdout.write('  Creating user accounts...')
        users_data = [
            {
                'username': 'owner',
                'password': 'owner123',
                'first_name': 'Company',
                'last_name': 'Owner',
                'role': 'owner',
                'employee_id': '',
                'team_id': '',
                'is_staff': True,
            },
            {
                'username': 'manager',
                'password': 'manager123',
                'first_name': 'Team A',
                'last_name': 'Manager',
                'role': 'manager',
                'employee_id': '',
                'team_id': 'TEAM-A',
                'is_staff': False,
            },
            {
                'username': 'finance',
                'password': 'finance123',
                'first_name': 'Payroll',
                'last_name': 'Officer',
                'role': 'finance',
                'employee_id': '',
                'team_id': '',
                'is_staff': False,
            },
            {
                'username': 'foreman',
                'password': 'foreman123',
                'first_name': 'Site',
                'last_name': 'Foreman',
                'role': 'foreman',
                'employee_id': 'EMP-004',
                'team_id': 'TEAM-A',
                'is_staff': False,
            },
            {
                'username': 'worker',
                'password': 'worker123',
                'first_name': 'Juan',
                'last_name': 'dela Cruz',
                'role': 'worker',
                'employee_id': 'EMP-001',
                'team_id': 'TEAM-A',
                'is_staff': False,
            },
        ]
        for data in users_data:
            password = data.pop('password')
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults=data,
            )
            if created:
                user.set_password(password)
                user.save()

    def _create_materials(self):
        self.stdout.write('  Creating materials...')
        materials_data = [
            {'material_id': 'MAT-001', 'name': 'Marine Plywood 4x8', 'category': 'Wood', 'quantity': 12, 'unit': 'sheets', 'min_stock': 20, 'unit_price': 2500, 'supplier': 'Davao Lumber Supply'},
            {'material_id': 'MAT-002', 'name': 'Epoxy Resin', 'category': 'Chemicals', 'quantity': 15, 'unit': 'liters', 'min_stock': 25, 'unit_price': 850, 'supplier': 'Marine Tech Philippines'},
            {'material_id': 'MAT-003', 'name': 'Fiberglass Cloth', 'category': 'Fabric', 'quantity': 8, 'unit': 'rolls', 'min_stock': 15, 'unit_price': 1200, 'supplier': 'Composite Materials Inc'},
            {'material_id': 'MAT-004', 'name': 'Stainless Steel Bolts M12', 'category': 'Hardware', 'quantity': 45, 'unit': 'pcs', 'min_stock': 100, 'unit_price': 15, 'supplier': 'Steel & Fasteners Co'},
            {'material_id': 'MAT-005', 'name': 'Marine Paint (White)', 'category': 'Paint', 'quantity': 35, 'unit': 'liters', 'min_stock': 20, 'unit_price': 750, 'supplier': 'Marine Coatings Ltd'},
            {'material_id': 'MAT-006', 'name': 'Yamaha 250HP Engine', 'category': 'Engine', 'quantity': 2, 'unit': 'units', 'min_stock': 2, 'unit_price': 450000, 'supplier': 'Yamaha Marine Davao'},
            {'material_id': 'MAT-007', 'name': 'Aluminum Sheet 4x8', 'category': 'Metal', 'quantity': 25, 'unit': 'sheets', 'min_stock': 15, 'unit_price': 3200, 'supplier': 'Metro Aluminum'},
            {'material_id': 'MAT-008', 'name': 'Hydraulic Steering System', 'category': 'Equipment', 'quantity': 5, 'unit': 'units', 'min_stock': 3, 'unit_price': 25000, 'supplier': 'Marine Parts Depot'},
        ]
        for data in materials_data:
            Material.objects.get_or_create(
                material_id=data['material_id'],
                defaults=data,
            )

    def _create_projects(self):
        self.stdout.write('  Creating projects...')
        projects_data = [
            {'project_id': 'PRJ-001', 'name': 'Coast Guard Patrol Boat', 'progress': 65, 'status': 'On Track', 'deadline': date(2025, 11, 25)},
            {'project_id': 'PRJ-002', 'name': 'Municipal Fishing Vessel', 'progress': 40, 'status': 'On Track', 'deadline': date(2025, 12, 10)},
            {'project_id': 'PRJ-003', 'name': 'Private Yacht Customization', 'progress': 85, 'status': 'Nearly Complete', 'deadline': date(2025, 11, 15)},
            {'project_id': 'PRJ-004', 'name': 'BFAR Monitoring Boat', 'progress': 25, 'status': 'Started', 'deadline': date(2026, 1, 20)},
        ]
        for data in projects_data:
            Project.objects.get_or_create(
                project_id=data['project_id'],
                defaults=data,
            )

    def _create_tasks(self):
        self.stdout.write('  Creating tasks...')
        prj_001 = Project.objects.get(project_id='PRJ-001')
        prj_002 = Project.objects.get(project_id='PRJ-002')
        prj_003 = Project.objects.get(project_id='PRJ-003')

        tasks_data = [
            {'task_id': 'TSK-001', 'project': prj_001, 'task_name': 'Hull Welding', 'assigned_to': 'Juan dela Cruz', 'assigned_by': 'Manager', 'status': 'In Progress', 'deadline': date(2025, 11, 12), 'description': 'Complete welding of main hull sections'},
            {'task_id': 'TSK-002', 'project': prj_001, 'task_name': 'Engine Installation', 'assigned_to': 'Pedro Santos', 'assigned_by': 'Manager', 'status': 'Pending', 'deadline': date(2025, 11, 15), 'description': 'Install and test Yamaha 250HP engine'},
            {'task_id': 'TSK-003', 'project': prj_002, 'task_name': 'Deck Construction', 'assigned_to': 'Maria Garcia', 'assigned_by': 'Manager', 'status': 'In Progress', 'deadline': date(2025, 11, 10), 'description': 'Build and install deck structure'},
            {'task_id': 'TSK-004', 'project': prj_003, 'task_name': 'Interior Finishing', 'assigned_to': 'Jose Reyes', 'assigned_by': 'Manager', 'status': 'Completed', 'deadline': date(2025, 11, 8), 'description': 'Complete interior woodwork and upholstery'},
            {'task_id': 'TSK-005', 'project': prj_003, 'task_name': 'Final Paint Job', 'assigned_to': 'Roberto Cruz', 'assigned_by': 'Manager', 'status': 'In Progress', 'deadline': date(2025, 11, 11), 'description': 'Apply final coat of marine paint'},
        ]
        for data in tasks_data:
            Task.objects.get_or_create(
                task_id=data['task_id'],
                defaults=data,
            )

    def _create_quality_checks(self):
        self.stdout.write('  Creating quality checks...')
        prj_001 = Project.objects.get(project_id='PRJ-001')
        prj_002 = Project.objects.get(project_id='PRJ-002')
        prj_003 = Project.objects.get(project_id='PRJ-003')

        qc_data = [
            {'qc_id': 'QC-001', 'project': prj_003, 'inspection_item': 'Hull Integrity', 'inspector': 'Foreman QC', 'result': 'Pass', 'notes': 'All welds inspected. No defects found.'},
            {'qc_id': 'QC-002', 'project': prj_001, 'inspection_item': 'Engine Mount', 'inspector': 'Foreman QC', 'result': 'Pass', 'notes': 'Mounting bolts properly torqued.'},
            {'qc_id': 'QC-003', 'project': prj_002, 'inspection_item': 'Deck Coating', 'inspector': 'Foreman QC', 'result': 'Fail', 'notes': 'Uneven coating in stern area. Requires rework.'},
            {'qc_id': 'QC-004', 'project': prj_001, 'inspection_item': 'Electrical System', 'inspector': 'Foreman QC', 'result': 'Pass', 'notes': 'All connections tested. Systems operational.'},
            {'qc_id': 'QC-005', 'project': prj_003, 'inspection_item': 'Fuel System', 'inspector': 'Foreman QC', 'result': 'Pass', 'notes': 'Pressure test completed successfully.'},
        ]
        for data in qc_data:
            QualityCheck.objects.get_or_create(
                qc_id=data['qc_id'],
                defaults=data,
            )

    def _create_payroll_records(self):
        self.stdout.write('  Creating payroll records...')
        emp_001 = Employee.objects.get(employee_id='EMP-001')
        emp_002 = Employee.objects.get(employee_id='EMP-002')
        emp_003 = Employee.objects.get(employee_id='EMP-003')

        payroll_data = [
            {'payroll_id': 'PAY-001', 'employee': emp_001, 'period': '2025-10', 'days_worked': 22, 'daily_rate': 850, 'gross_pay': 18700, 'deductions': 1870, 'net_pay': 16830, 'status': 'Paid'},
            {'payroll_id': 'PAY-002', 'employee': emp_002, 'period': '2025-10', 'days_worked': 22, 'daily_rate': 900, 'gross_pay': 19800, 'deductions': 1980, 'net_pay': 17820, 'status': 'Paid'},
            {'payroll_id': 'PAY-003', 'employee': emp_003, 'period': '2025-10', 'days_worked': 20, 'daily_rate': 750, 'gross_pay': 15000, 'deductions': 1500, 'net_pay': 13500, 'status': 'Paid'},
            {'payroll_id': 'PAY-004', 'employee': emp_001, 'period': '2025-11', 'days_worked': 9, 'daily_rate': 850, 'gross_pay': 7650, 'deductions': 765, 'net_pay': 6885, 'status': 'Pending'},
            {'payroll_id': 'PAY-005', 'employee': emp_002, 'period': '2025-11', 'days_worked': 9, 'daily_rate': 900, 'gross_pay': 8100, 'deductions': 810, 'net_pay': 7290, 'status': 'Pending'},
        ]
        for data in payroll_data:
            PayrollRecord.objects.get_or_create(
                payroll_id=data['payroll_id'],
                defaults=data,
            )

    def _create_dtr_records(self):
        self.stdout.write('  Creating DTR records...')
        emp_001 = Employee.objects.get(employee_id='EMP-001')
        emp_002 = Employee.objects.get(employee_id='EMP-002')
        emp_003 = Employee.objects.get(employee_id='EMP-003')
        emp_004 = Employee.objects.get(employee_id='EMP-004')

        dtr_data = [
            {'dtr_id': 'DTR-001', 'employee': emp_001, 'team_id': 'TEAM-A', 'date': date(2025, 11, 7), 'time_in': '08:00', 'time_out': '17:30', 'break_minutes': 60, 'overtime_hours': Decimal('1.5'), 'status': 'Present'},
            {'dtr_id': 'DTR-002', 'employee': emp_002, 'team_id': 'TEAM-A', 'date': date(2025, 11, 7), 'time_in': '08:15', 'time_out': '17:00', 'break_minutes': 60, 'overtime_hours': Decimal('0'), 'status': 'Present'},
            {'dtr_id': 'DTR-003', 'employee': emp_003, 'team_id': 'TEAM-A', 'date': date(2025, 11, 7), 'time_in': '08:05', 'time_out': '16:30', 'break_minutes': 45, 'overtime_hours': Decimal('0'), 'status': 'Present'},
            {'dtr_id': 'DTR-004', 'employee': emp_004, 'team_id': 'TEAM-A', 'date': date(2025, 11, 7), 'time_in': '-', 'time_out': '-', 'break_minutes': 0, 'overtime_hours': Decimal('0'), 'status': 'On Leave'},
        ]
        for data in dtr_data:
            DTRRecord.objects.get_or_create(
                dtr_id=data['dtr_id'],
                defaults=data,
            )
