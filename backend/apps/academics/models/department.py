from django.db import models


class Department(models.Model):
    """
    Represents a university department.

    Example:
        AIML
        CSE
        ECE
    """

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