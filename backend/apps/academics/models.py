from django.core.exceptions import ValidationError
from django.db import models


class AcademicYear(models.Model):
    year_name = models.CharField(
        max_length=20,
        unique=True,
        help_text="Example: 2026-2027",
    )

    start_date = models.DateField()

    end_date = models.DateField()

    is_active = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "Academic Year"
        verbose_name_plural = "Academic Years"

    def clean(self):
        if self.start_date >= self.end_date:
            raise ValidationError(
                "End date must be greater than start date."
            )

    def save(self, *args, **kwargs):
        self.clean()

        if self.is_active:
            AcademicYear.objects.exclude(
                pk=self.pk
            ).update(is_active=False)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.year_name


class Department(models.Model):
    name = models.CharField(
        max_length=150,
        unique=True,
    )

    code = models.CharField(
        max_length=10,
        unique=True,
    )

    hod_name = models.CharField(
        max_length=100,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Program(models.Model):
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="programs",
    )

    name = models.CharField(
        max_length=150,
    )

    code = models.CharField(
        max_length=20,
        unique=True,
    )

    duration_years = models.PositiveIntegerField(
        default=4,
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

    def __str__(self):
        return f"{self.code} - {self.name}"