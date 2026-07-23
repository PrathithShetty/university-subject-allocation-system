from django.contrib import admin

from .models import (
    AcademicYear,
    Department,
    Program,
    Semester,
    Section,
)


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


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = (
        "program",
        "semester_number",
        "name",
        "is_active",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "program",
        "is_active",
    )

    ordering = (
        "program",
        "semester_number",
    )


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = (
        "semester",
        "name",
        "capacity",
        "is_active",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "semester",
        "is_active",
    )

    ordering = (
        "semester",
        "name",
    )