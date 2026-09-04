from rest_framework import serializers

from apps.allocation.models import (
    AllocationConflict,
    AllocationRun,
    SubjectAllocation,
)


class AllocationConflictSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(
        source="faculty.full_name",
        read_only=True,
    )

    class Meta:
        model = AllocationConflict
        fields = [
            "id",
            "allocation_run",
            "faculty",
            "faculty_name",
            "conflict_type",
            "severity",
            "status",
            "message",
            "details",
            "created_at",
            "resolved_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "resolved_at",
        ]


class SubjectAllocationSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(
        source="faculty.full_name",
        read_only=True,
    )

    subject_code = serializers.CharField(
        source="subject_offering.subject.code",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject_offering.subject.name",
        read_only=True,
    )

    section_name = serializers.CharField(
        source="section.name",
        read_only=True,
    )

    class Meta:
        model = SubjectAllocation
        fields = [
            "id",
            "allocation_run",
            "subject_offering",
            "subject_code",
            "subject_name",
            "faculty",
            "faculty_name",
            "section",
            "section_name",
            "day",
            "slot_number",
            "status",
            "preference_score",
            "workload_hours",
            "is_preference_matched",
            "is_conflict_free",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "preference_score",
            "workload_hours",
            "is_preference_matched",
            "is_conflict_free",
            "notes",
            "created_at",
            "updated_at",
        ]


class AllocationRunSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(
        source="academic_year.name",
        read_only=True,
    )

    allocation_count = serializers.IntegerField(
        source="subject_allocations.count",
        read_only=True,
    )

    conflict_count = serializers.IntegerField(
        source="conflicts.count",
        read_only=True,
    )

    class Meta:
        model = AllocationRun
        fields = [
            "id",
            "name",
            "academic_year",
            "academic_year_name",
            "status",
            "started_at",
            "completed_at",
            "error_message",
            "allocation_count",
            "conflict_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "started_at",
            "completed_at",
            "error_message",
            "allocation_count",
            "conflict_count",
            "created_at",
            "updated_at",
        ]