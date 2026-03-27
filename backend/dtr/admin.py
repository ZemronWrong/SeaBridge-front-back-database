from django.contrib import admin
from .models import DTRRecord


@admin.register(DTRRecord)
class DTRRecordAdmin(admin.ModelAdmin):
    list_display = ['dtr_id', 'employee', 'team_id', 'date', 'time_in', 'time_out', 'break_minutes', 'overtime_hours', 'status']
    list_filter = ['status', 'team_id', 'date']
    search_fields = ['dtr_id', 'employee__name']
    date_hierarchy = 'date'
