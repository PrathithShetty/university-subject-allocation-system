from django.contrib import admin

from .models import (
    PreferenceCycle,
    FacultyPreference,
    FacultyAvailability,
    PreferredSection,
    PreferredTimeSlot,
    WorkloadPreference,
)


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


@admin.register(FacultyPreference)
class FacultyPreferenceAdmin(admin.ModelAdmin):
    list_display = (
        "faculty",
        "subject",
        "priority",
        "preference_cycle",
    )

    list_filter = (
        "preference_cycle",
    )

    search_fields = (
        "faculty__first_name",
        "faculty__last_name",
        "subject__name",
    )


@admin.register(FacultyAvailability)
class FacultyAvailabilityAdmin(admin.ModelAdmin):
    list_display = (
        "faculty",
        "day",
        "slot_number",
        "is_available",
    )

    list_filter = (
        "day",
        "is_available",
    )

    search_fields = (
        "faculty__employee_id",
        "faculty__first_name",
        "faculty__last_name",
    )


@admin.register(PreferredSection)
class PreferredSectionAdmin(admin.ModelAdmin):
    list_display = (
        "faculty",
        "section",
        "priority",
        "preference_cycle",
    )

    list_filter = (
        "preference_cycle",
    )

    search_fields = (
        "faculty__employee_id",
        "faculty__first_name",
        "faculty__last_name",
        "section__name",
    )


@admin.register(PreferredTimeSlot)
class PreferredTimeSlotAdmin(admin.ModelAdmin):
    list_display = (
        "faculty",
        "day",
        "slot_number",
        "priority",
        "preference_cycle",
    )

    list_filter = (
        "day",
        "preference_cycle",
    )

    search_fields = (
        "faculty__employee_id",
        "faculty__first_name",
        "faculty__last_name",
    )

    ordering = (
        "faculty",
        "priority",
    )


@admin.register(WorkloadPreference)
class WorkloadPreferenceAdmin(admin.ModelAdmin):
    list_display = (
        "faculty",
        "preference_cycle",
        "minimum_hours",
        "preferred_hours",
        "maximum_hours",
    )

    list_filter = (
        "preference_cycle",
    )

    search_fields = (
        "faculty__employee_id",
        "faculty__first_name",
        "faculty__last_name",
    )

    ordering = (
        "faculty",
    )