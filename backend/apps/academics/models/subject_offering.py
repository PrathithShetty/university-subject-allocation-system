from django.db import models

from .section import Section
from .subject import Subject


class SubjectOffering(models.Model):
    """
    Represents a subject offered to a section.
    """

    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="subject_offerings",
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="subject_offerings",
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
        ordering = ["section", "subject"]

        unique_together = (
            "section",
            "subject",
        )

    def __str__(self):
        return f"{self.section} - {self.subject.code}"