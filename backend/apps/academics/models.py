from django.core.exceptions import ValidationError
from django.db import models


class AcademicYear(models.Model):
    """
    Represents an academic year in the university.
    Example:
        2025-2026
        2026-2027
    """

    year_name = models.CharField(
        max_length=20,
        unique=True,
        help_text="Example: 2026-2027"
    )

    start_date = models.DateField()

    end_date = models.DateField()

    is_active = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "Academic Year"
        verbose_name_plural = "Academic Years"

    def clean(self):
        """
        Validation before saving.
        """

        if self.start_date >= self.end_date:
            raise ValidationError(
                "End date must be greater than start date."
            )

    def save(self, *args, **kwargs):

        self.clean()

        if self.is_active:
            AcademicYear.objects.exclude(
                pk=self.pk
            ).update(
                is_active=False
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.year_name