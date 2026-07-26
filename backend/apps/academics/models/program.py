from django.db import models

from .department import Department


class Program(models.Model):
    """
    Represents a degree program.

    Example:
        B.Tech AIML
        B.Tech CSE
        M.Tech CSE
    """

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