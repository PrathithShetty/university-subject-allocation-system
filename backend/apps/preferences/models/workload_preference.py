from django.db import models

from apps.staff.models import Faculty

from .preference_cycle import PreferenceCycle


class WorkloadPreference(models.Model):
    """
    Stores the preferred teaching workload of a faculty member
    for a specific preference cycle.
    """

    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.CASCADE,
        related_name="workload_preferences",
    )

    preference_cycle = models.ForeignKey(
        PreferenceCycle,
        on_delete=models.CASCADE,
        related_name="workload_preferences",
    )

    minimum_hours = models.PositiveSmallIntegerField(
        default=0,
    )

    preferred_hours = models.PositiveSmallIntegerField()

    maximum_hours = models.PositiveSmallIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "faculty",
        ]

        unique_together = (
            "faculty",
            "preference_cycle",
        )

    def __str__(self):
        return (
            f"{self.faculty.full_name} - "
            f"{self.preferred_hours} hrs "
            f"(Max {self.maximum_hours} hrs)"
        )