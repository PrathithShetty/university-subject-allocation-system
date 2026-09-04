from django.db import models

from apps.staff.models import Faculty


class FacultyAvailability(models.Model):
    """
    Stores the availability of a faculty member for each day and slot.
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
        related_name="availabilities",
    )

    day = models.CharField(
        max_length=10,
        choices=Day.choices,
    )

    slot_number = models.PositiveSmallIntegerField()

    is_available = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "faculty",
            "day",
            "slot_number",
        ]

        unique_together = (
            "faculty",
            "day",
            "slot_number",
        )

    def __str__(self):
        status = "Available" if self.is_available else "Unavailable"

        return (
            f"{self.faculty.full_name} - "
            f"{self.day} - "
            f"Slot {self.slot_number} "
            f"({status})"
        )