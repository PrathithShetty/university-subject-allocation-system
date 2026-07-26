from django.contrib import admin

from .models import (
    Designation,
    Faculty,
)


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "is_active",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "is_active",
    )

    ordering = (
        "name",
    )


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = (
        "employee_id",
        "full_name",
        "department",
        "designation",
        "max_workload_hours",
        "is_active",
    )

    search_fields = (
        "employee_id",
        "first_name",
        "last_name",
        "email",
    )

    list_filter = (
        "department",
        "designation",
        "is_active",
    )

    ordering = (
        "employee_id",
    )

    list_select_related = (
        "department",
        "designation",
    )