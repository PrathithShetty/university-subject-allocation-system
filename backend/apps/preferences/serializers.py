from rest_framework import serializers

from .models import (
    PreferenceCycle,
    FacultyPreference,
    PreferredSection,
    PreferredTimeSlot,
    FacultyAvailability,
    WorkloadPreference,
)


class PreferenceCycleSerializer(serializers.ModelSerializer):

    class Meta:
        model = PreferenceCycle

        fields = [
            "id",
            "name",
            "academic_year",
            "start_date",
            "end_date",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class FacultyPreferenceSerializer(serializers.ModelSerializer):

    class Meta:
        model = FacultyPreference

        fields = [
            "id",
            "faculty",
            "preference_cycle",
            "subject",
            "priority",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class PreferredSectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = PreferredSection

        fields = [
            "id",
            "faculty",
            "preference_cycle",
            "section",
            "priority",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class PreferredTimeSlotSerializer(serializers.ModelSerializer):

    class Meta:
        model = PreferredTimeSlot

        fields = [
            "id",
            "faculty",
            "preference_cycle",
            "day",
            "slot_number",
            "priority",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class FacultyAvailabilitySerializer(serializers.ModelSerializer):

    class Meta:
        model = FacultyAvailability

        fields = [
            "id",
            "faculty",
            "day",
            "slot_number",
            "is_available",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class WorkloadPreferenceSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkloadPreference

        fields = [
            "id",
            "faculty",
            "preference_cycle",
            "minimum_hours",
            "preferred_hours",
            "maximum_hours",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]