from django.core.management.base import BaseCommand
from production.services import check_deadline_violations


class Command(BaseCommand):
    help = 'Check for overdue tasks and apply deadline policy (warning/review/deduction)'

    def handle(self, *args, **options):
        flagged = check_deadline_violations()
        if flagged:
            self.stdout.write(self.style.WARNING(
                f'Flagged {len(flagged)} overdue task(s):'
            ))
            for task in flagged:
                self.stdout.write(
                    f'  - {task.task_name} ({task.assigned_to}) → {task.deadline_flag}'
                )
        else:
            self.stdout.write(self.style.SUCCESS('No new deadline violations found.'))
