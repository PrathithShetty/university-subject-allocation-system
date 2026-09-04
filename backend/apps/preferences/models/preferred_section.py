from django.db import models

from apps.staff.models import Faculty
from apps.academics.models import Section

from .preference_cycle import PreferenceCycle


class PreferredSection(models.Model):
    """
    Stores a faculty member's preferred teaching sections.
    """

    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.CASCADE,
        related_name="preferred_sections",
    )

    preference_cycle = models.ForeignKey(
        PreferenceCycle,
        on_delete=models.CASCADE,
        related_name="preferred_sections",
    )

    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="preferred_faculties",
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
            f"{self.faculty.full_name} - "
            f"{self.section} "
            f"(Priority {self.priority})"
        )