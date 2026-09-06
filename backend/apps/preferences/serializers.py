from rest_framework import serializers

from .models import (
    PreferenceCycle,
    FacultyPreference,
    PreferredSection,
    PreferredTimeSlot,
    FacultyAvailability,
    WorkloadPreference,
)

MIN_PRIORITY = 1
MAX_PRIORITY = 5

MIN_SLOT_NUMBER = 1
MAX_SLOT_NUMBER = 8


def validate_priority_range(value):
    if not (MIN_PRIORITY <= value <= MAX_PRIORITY):
        raise serializers.ValidationError(
            f"Priority must be between {MIN_PRIORITY} and "
            f"{MAX_PRIORITY}."
        )

    return value


def validate_slot_number_range(value):
    if not (MIN_SLOT_NUMBER <= value <= MAX_SLOT_NUMBER):
        raise serializers.ValidationError(
            f"Slot number must be between {MIN_SLOT_NUMBER} and "
            f"{MAX_SLOT_NUMBER}."
        )

    return value


def reject_if_cycle_closed(preference_cycle):
    if preference_cycle.status == PreferenceCycle.Status.CLOSED:
        raise serializers.ValidationError(
            {
                "preference_cycle": (
                    "This preference cycle is closed and can no "
                    "longer be modified."
                )
            }
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

    def validate(self, attrs):
        start_date = attrs.get(
            "start_date",
            getattr(self.instance, "start_date", None),
        )

        end_date = attrs.get(
            "end_date",
            getattr(self.instance, "end_date", None),
        )

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError(
                {
                    "end_date": (
                        "End date must be after the start date."
                    )
                }
            )

        return attrs


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

    def validate_priority(self, value):
        return validate_priority_range(value)

    def validate(self, attrs):
        preference_cycle = attrs.get(
            "preference_cycle",
            getattr(self.instance, "preference_cycle", None),
        )

        if preference_cycle is not None:
            reject_if_cycle_closed(preference_cycle)

        return attrs


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

    def validate_priority(self, value):
        return validate_priority_range(value)

    def validate(self, attrs):
        preference_cycle = attrs.get(
            "preference_cycle",
            getattr(self.instance, "preference_cycle", None),
        )

        if preference_cycle is not None:
            reject_if_cycle_closed(preference_cycle)

        return attrs


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

    def validate_priority(self, value):
        return validate_priority_range(value)

    def validate_slot_number(self, value):
        return validate_slot_number_range(value)

    def validate(self, attrs):
        preference_cycle = attrs.get(
            "preference_cycle",
            getattr(self.instance, "preference_cycle", None),
        )

        if preference_cycle is not None:
            reject_if_cycle_closed(preference_cycle)

        return attrs


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

    def validate_slot_number(self, value):
        return validate_slot_number_range(value)


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

    def validate(self, attrs):
        minimum_hours = attrs.get(
            "minimum_hours",
            getattr(self.instance, "minimum_hours", 0),
        )

        preferred_hours = attrs.get(
            "preferred_hours",
            getattr(self.instance, "preferred_hours", None),
        )

        maximum_hours = attrs.get(
            "maximum_hours",
            getattr(self.instance, "maximum_hours", None),
        )

        if (
            minimum_hours is not None
            and preferred_hours is not None
            and minimum_hours > preferred_hours
        ):
            raise serializers.ValidationError(
                {
                    "preferred_hours": (
                        "Preferred hours cannot be less than "
                        "minimum hours."
                    )
                }
            )

        if (
            preferred_hours is not None
            and maximum_hours is not None
            and preferred_hours > maximum_hours
        ):
            raise serializers.ValidationError(
                {
                    "maximum_hours": (
                        "Maximum hours cannot be less than "
                        "preferred hours."
                    )
                }
            )

        preference_cycle = attrs.get(
            "preference_cycle",
            getattr(self.instance, "preference_cycle", None),
        )

        if preference_cycle is not None:
            reject_if_cycle_closed(preference_cycle)

        return attrs
