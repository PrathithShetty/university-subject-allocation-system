from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for the Subject Allocation System.
    """

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrator"
        HOD = "HOD", "Head of Department"
        FACULTY = "FACULTY", "Faculty"

    email = models.EmailField(
        unique=True,
    )

    phone_number = models.CharField(
        max_length=15,
        blank=True,
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.FACULTY,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.username