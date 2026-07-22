from django.contrib import admin

from .models import AcademicYear, Department, Program


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = (
        "year_name",
        "start_date",
        "end_date",
        "is_active",
    )

    list_filter = ("is_active",)

    search_fields = ("year_name",)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "hod_name",
        "is_active",
    )

    search_fields = (
        "code",
        "name",
        "hod_name",
    )

    list_filter = (
        "is_active",
    )


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "department",
        "duration_years",
        "is_active",
    )

    search_fields = (
        "code",
        "name",
    )

    list_filter = (
        "department",
        "is_active",
    )