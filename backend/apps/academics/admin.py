from django.contrib import admin

from .models import AcademicYear


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):

    list_display = (
        "year_name",
        "start_date",
        "end_date",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "year_name",
    )

    ordering = (
        "-start_date",
    )