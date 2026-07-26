from django.contrib import admin

from .models import PreferenceCycle


@admin.register(PreferenceCycle)
class PreferenceCycleAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "academic_year",
        "status",
        "start_date",
        "end_date",
    )

    list_filter = (
        "status",
        "academic_year",
    )

    search_fields = (
        "name",
    )