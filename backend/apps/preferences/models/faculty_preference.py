from django.db import models

from apps.staff.models import Faculty
from apps.academics.models import Subject

from .preference_cycle import PreferenceCycle


class FacultyPreference(models.Model):
    """
    Stores a faculty member's preferred subjects.
    """

    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.CASCADE,
        related_name="preferences",
    )

    preference_cycle = models.ForeignKey(
        PreferenceCycle,
        on_delete=models.CASCADE,
        related_name="faculty_preferences",
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="faculty_preferences",
    )

    priority = models.PositiveSmallIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "faculty",
            "priority",
        ]

        unique_together = (
            "faculty",
            "preference_cycle",
            "priority",
        )

    def __str__(self):
        return (
            f"{self.faculty.full_name} "
            f"- {self.subject.code} "
            f"(Priority {self.priority})"
        )