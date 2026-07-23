from django.core.exceptions import ValidationError
from django.db import models


class AcademicYear(models.Model):
    """
    Represents an academic year.

    Example:
        2026-2027
        2027-2028
    """

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