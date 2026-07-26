from django.conf import settings
from django.db import models

from apps.academics.models import Department

from .designation import Designation


class Faculty(models.Model):
    """
    Represents a faculty member.
    """

    employee_id = models.CharField(
        max_length=20,
        unique=True,
    )

    first_name = models.CharField(
        max_length=100,
    )

    last_name = models.CharField(
        max_length=100,
    )

    email = models.EmailField(
        unique=True,
    )

    phone_number = models.CharField(
        max_length=15,
        blank=True,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="faculties",
    )

    designation = models.ForeignKey(
        Designation,
        on_delete=models.PROTECT,
        related_name="faculties",
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="faculty_profile",
        null=True,
        blank=True,
    )

    joining_date = models.DateField()

    max_workload_hours = models.PositiveIntegerField(
        default=18,
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
        ordering = [
            "employee_id",
        ]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"