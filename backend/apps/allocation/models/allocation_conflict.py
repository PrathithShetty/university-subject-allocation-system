from django.db import models

from apps.staff.models import Faculty

from .allocation_run import AllocationRun


class AllocationConflict(models.Model):
    """
    Represents a conflict detected during or after allocation.
    """

    class ConflictType(models.TextChoices):
        FACULTY_OVERLOAD = (
            "FACULTY_OVERLOAD",
            "Faculty Overload",
        )

        FACULTY_UNAVAILABLE = (
            "FACULTY_UNAVAILABLE",
            "Faculty Unavailable",
        )

        SCHEDULE_CONFLICT = (
            "SCHEDULE_CONFLICT",
            "Schedule Conflict",
        )

        DUPLICATE_ALLOCATION = (
            "DUPLICATE_ALLOCATION",
            "Duplicate Allocation",
        )

        SECTION_CONFLICT = (
            "SECTION_CONFLICT",
            "Section Conflict",
        )

        SUBJECT_CONFLICT = (
            "SUBJECT_CONFLICT",
            "Subject Conflict",
        )

        NO_ELIGIBLE_FACULTY = (
            "NO_ELIGIBLE_FACULTY",
            "No Eligible Faculty",
        )

        PREFERENCE_VIOLATION = (
            "PREFERENCE_VIOLATION",
            "Preference Violation",
        )

    class Severity(models.TextChoices):
        INFO = "INFO", "Information"
        WARNING = "WARNING", "Warning"
        ERROR = "ERROR", "Error"
        CRITICAL = "CRITICAL", "Critical"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        RESOLVED = "RESOLVED", "Resolved"
        IGNORED = "IGNORED", "Ignored"

    allocation_run = models.ForeignKey(
        AllocationRun,
        on_delete=models.CASCADE,
        related_name="conflicts",
    )

    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.SET_NULL,
        related_name="allocation_conflicts",
        null=True,
        blank=True,
    )

    conflict_type = models.CharField(
        max_length=40,
        choices=ConflictType.choices,
    )

    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.WARNING,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )

    message = models.TextField()

    details = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = [
            "-created_at",
        ]

    def __str__(self):
        faculty_name = (
            self.faculty.full_name
            if self.faculty
            else "System"
        )

        return (
            f"{self.conflict_type} - "
            f"{faculty_name} - "
            f"{self.severity}"
        )