from datetime import date

from rest_framework.test import APITestCase

from apps.academics.models import (
    AcademicYear,
    Department,
    Program,
    Semester,
    Subject,
)
from apps.accounts.models import User
from apps.preferences.models import (
    FacultyPreference,
    PreferenceCycle,
    WorkloadPreference,
)
from apps.staff.models import Designation, Faculty


class PreferenceApiTests(APITestCase):

    def setUp(self):
        self.academic_year = AcademicYear.objects.create(
            year_name="2099-2100",
            start_date=date(2099, 7, 1),
            end_date=date(2100, 6, 30),
        )

        department = Department.objects.create(
            name="Pref Department",
            code="PREFDEPT",
        )

        program = Program.objects.create(
            department=department,
            name="Pref Program",
            code="PREFPROG",
        )

        semester = Semester.objects.create(
            program=program,
            semester_number=1,
        )

        self.subject = Subject.objects.create(
            semester=semester,
            name="Pref Subject",
            code="PREF101",
            credits=4,
        )

        designation = Designation.objects.create(
            name="Pref Designation",
        )

        self.faculty = Faculty.objects.create(
            employee_id="P001",
            first_name="Pref",
            last_name="Faculty",
            email="preffaculty@example.com",
            department=department,
            designation=designation,
            joining_date=date(2020, 1, 1),
        )

        self.open_cycle = PreferenceCycle.objects.create(
            name="Open Cycle",
            academic_year=self.academic_year,
            start_date=date(2099, 1, 1),
            end_date=date(2099, 1, 31),
            status=PreferenceCycle.Status.OPEN,
        )

        self.closed_cycle = PreferenceCycle.objects.create(
            name="Closed Cycle",
            academic_year=self.academic_year,
            start_date=date(2099, 2, 1),
            end_date=date(2099, 2, 28),
            status=PreferenceCycle.Status.CLOSED,
        )

        self.user = User.objects.create_user(
            username="preftester",
            password="testpass123",
        )

        self.client.force_authenticate(user=self.user)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(
            "/api/preferences/faculty-preferences/"
        )

        self.assertEqual(response.status_code, 401)

    def test_priority_out_of_range_is_rejected(self):
        response = self.client.post(
            "/api/preferences/faculty-preferences/",
            {
                "faculty": self.faculty.id,
                "preference_cycle": self.open_cycle.id,
                "subject": self.subject.id,
                "priority": 9,
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("priority", response.data)

    def test_cannot_create_preference_for_closed_cycle(self):
        response = self.client.post(
            "/api/preferences/faculty-preferences/",
            {
                "faculty": self.faculty.id,
                "preference_cycle": self.closed_cycle.id,
                "subject": self.subject.id,
                "priority": 1,
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("preference_cycle", response.data)

    def test_full_crud_lifecycle_for_faculty_preference(self):
        create_response = self.client.post(
            "/api/preferences/faculty-preferences/",
            {
                "faculty": self.faculty.id,
                "preference_cycle": self.open_cycle.id,
                "subject": self.subject.id,
                "priority": 1,
            },
        )

        self.assertEqual(create_response.status_code, 201)

        preference_id = create_response.data["id"]

        update_response = self.client.put(
            f"/api/preferences/faculty-preferences/{preference_id}/",
            {
                "faculty": self.faculty.id,
                "preference_cycle": self.open_cycle.id,
                "subject": self.subject.id,
                "priority": 2,
            },
        )

        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data["priority"], 2)

        delete_response = self.client.delete(
            f"/api/preferences/faculty-preferences/{preference_id}/"
        )

        self.assertEqual(delete_response.status_code, 204)

        self.assertFalse(
            FacultyPreference.objects.filter(
                id=preference_id,
            ).exists()
        )

    def test_duplicate_priority_for_same_cycle_is_rejected(self):
        FacultyPreference.objects.create(
            faculty=self.faculty,
            preference_cycle=self.open_cycle,
            subject=self.subject,
            priority=1,
        )

        response = self.client.post(
            "/api/preferences/faculty-preferences/",
            {
                "faculty": self.faculty.id,
                "preference_cycle": self.open_cycle.id,
                "subject": self.subject.id,
                "priority": 1,
            },
        )

        self.assertEqual(response.status_code, 400)

    def test_workload_preference_hours_ordering_is_validated(self):
        response = self.client.post(
            "/api/preferences/workload-preferences/",
            {
                "faculty": self.faculty.id,
                "preference_cycle": self.open_cycle.id,
                "minimum_hours": 20,
                "preferred_hours": 10,
                "maximum_hours": 15,
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("preferred_hours", response.data)

    def test_workload_preference_valid_hours_are_accepted(self):
        response = self.client.post(
            "/api/preferences/workload-preferences/",
            {
                "faculty": self.faculty.id,
                "preference_cycle": self.open_cycle.id,
                "minimum_hours": 8,
                "preferred_hours": 12,
                "maximum_hours": 18,
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            WorkloadPreference.objects.filter(
                faculty=self.faculty,
                preference_cycle=self.open_cycle,
            ).exists()
        )
