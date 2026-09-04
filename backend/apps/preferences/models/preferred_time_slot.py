from django.db import models

from apps.staff.models import Faculty

from .preference_cycle import PreferenceCycle


class PreferredTimeSlot(models.Model):
    """
    Stores a faculty member's preferred teaching time slots.
    """

    class Day(models.TextChoices):
        MONDAY = "MONDAY", "Monday"
        TUESDAY = "TUESDAY", "Tuesday"
        WEDNESDAY = "WEDNESDAY", "Wednesday"
        THURSDAY = "THURSDAY", "Thursday"
        FRIDAY = "FRIDAY", "Friday"
        SATURDAY = "SATURDAY", "Saturday"

    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.CASCADE,
        related_name="preferred_time_slots",
    )

    preference_cycle = models.ForeignKey(
        PreferenceCycle,
        on_delete=models.CASCADE,
        related_name="preferred_time_slots",
    )

    day = models.CharField(
        max_length=10,
        choices=Day.choices,
    )

    slot_number = models.PositiveSmallIntegerField()

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
            "day",
            "slot_number",
        )

    def __str__(self):
        return (
            f"{self.faculty.full_name} - "
            f"{self.day} Slot {self.slot_number} "
            f"(Priority {self.priority})"
        )