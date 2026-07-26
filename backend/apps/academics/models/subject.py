from django.db import models

from .semester import Semester


class Subject(models.Model):
    """
    Represents a university subject.
    """

    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE,
        related_name="subjects",
    )

    name = models.CharField(
        max_length=150,
    )

    code = models.CharField(
        max_length=20,
        unique=True,
    )

    credits = models.PositiveSmallIntegerField(
        default=4,
    )

    is_lab = models.BooleanField(
        default=False,
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
        ordering = ["code"]

        unique_together = (
            "semester",
            "code",
        )

    def __str__(self):
        return f"{self.code} - {self.name}"