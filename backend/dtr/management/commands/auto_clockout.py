from django.core.management.base import BaseCommand
from django.conf import settings
from dtr.services import auto_clockout_all


class Command(BaseCommand):
    help = 'Auto clock-out all employees with open time records at cutoff time'

    def handle(self, *args, **options):
        if not getattr(settings, 'AUTO_TIMEOUT_ENABLED', False):
            self.stdout.write(self.style.WARNING(
                'AUTO_TIMEOUT_ENABLED is False. Set to True in settings or env to enable.'
            ))
            return

        flagged = auto_clockout_all()
        if flagged:
            self.stdout.write(self.style.SUCCESS(
                f'Auto clocked-out {len(flagged)} record(s). Flagged for HR review.'
            ))
            for record in flagged:
                self.stdout.write(f'  - {record.employee.name} ({record.date})')
        else:
            self.stdout.write(self.style.SUCCESS('No open records found.'))
