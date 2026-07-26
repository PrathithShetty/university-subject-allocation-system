from django.db import models

from .semester import Semester


class Section(models.Model):
    """
    Represents a class section.

    Example:
        Section A
        Section B
        Section C
    """

    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name="sections",
    )

    name = models.CharField(
        max_length=10,
    )

    capacity = models.PositiveIntegerField(
        default=60,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["name"]

        unique_together = (
            "semester",
            "name",
        )

    def __str__(self):
        return f"{self.semester} - Section {self.name}"