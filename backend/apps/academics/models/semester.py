from django.db import models

from .program import Program


class Semester(models.Model):
    """
    Represents one semester of a program.

    Example:
        Semester 1
        Semester 2
        Semester 3
    """

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name="semesters",
    )

    semester_number = models.PositiveSmallIntegerField()

    name = models.CharField(
        max_length=50,
        blank=True,
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
        ordering = ["semester_number"]

        unique_together = (
            "program",
            "semester_number",
        )

    def save(self, *args, **kwargs):
        self.name = f"Semester {self.semester_number}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.program.code} - Semester {self.semester_number}"