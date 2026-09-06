from datetime import date

from django.test import TestCase
from rest_framework.test import APITestCase

from apps.academics.models import (
    AcademicYear,
    Department,
    Program,
    Section,
    Semester,
    Subject,
    SubjectOffering,
)
from apps.accounts.models import User
from apps.allocation.models import (
    AllocationConflict,
    AllocationRun,
    SubjectAllocation,
)
from apps.allocation.services.allocation_engine import AllocationEngine
from apps.allocation.services.conflict_checker import (
    AllocationConflictChecker,
)
from apps.preferences.models import (
    FacultyPreference,
    PreferenceCycle,
    WorkloadPreference,
)
from apps.staff.models import Designation, Faculty


def build_academic_tree():
    academic_year = AcademicYear.objects.create(
        year_name="2099-2100",
        start_date=date(2099, 7, 1),
        end_date=date(2100, 6, 30),
    )

    department = Department.objects.create(
        name="Test Department",
        code="TESTDEPT",
    )

    program = Program.objects.create(
        department=department,
        name="Test Program",
        code="TESTPROG",
    )

    semester = Semester.objects.create(
        program=program,
        semester_number=1,
    )

    return academic_year, department, semester


class AllocationEngineTests(TestCase):
    """
    Exercises the allocation engine against a small, controlled
    dataset so the fairness, hard-constraint, and failure-handling
    behavior can be verified deterministically.
    """

    def setUp(self):
        self.academic_year, self.department, self.semester = (
            build_academic_tree()
        )

        self.section_a = Section.objects.create(
            semester=self.semester,
            name="A",
        )

        self.section_b = Section.objects.create(
            semester=self.semester,
            name="B",
        )

        self.subject_1 = Subject.objects.create(
            semester=self.semester,
            name="Subject One",
            code="SUB101",
            credits=4,
        )

        self.subject_2 = Subject.objects.create(
            semester=self.semester,
            name="Subject Two",
            code="SUB102",
            credits=4,
        )

        self.offering_a1 = SubjectOffering.objects.create(
            section=self.section_a,
            subject=self.subject_1,
        )

        self.offering_a2 = SubjectOffering.objects.create(
            section=self.section_a,
            subject=self.subject_2,
        )

        self.offering_b1 = SubjectOffering.objects.create(
            section=self.section_b,
            subject=self.subject_1,
        )

        self.designation = Designation.objects.create(
            name="Test Designation",
        )

        self.faculty_1 = Faculty.objects.create(
            employee_id="T001",
            first_name="Faculty",
            last_name="One",
            email="faculty1@example.com",
            department=self.department,
            designation=self.designation,
            joining_date=date(2020, 1, 1),
            max_workload_hours=18,
        )

        self.faculty_2 = Faculty.objects.create(
            employee_id="T002",
            first_name="Faculty",
            last_name="Two",
            email="faculty2@example.com",
            department=self.department,
            designation=self.designation,
            joining_date=date(2020, 1, 1),
            max_workload_hours=18,
        )

        self.preference_cycle = PreferenceCycle.objects.create(
            name="Test Cycle",
            academic_year=self.academic_year,
            start_date=date(2099, 1, 1),
            end_date=date(2099, 1, 31),
            status=PreferenceCycle.Status.OPEN,
        )

        FacultyPreference.objects.create(
            faculty=self.faculty_1,
            preference_cycle=self.preference_cycle,
            subject=self.subject_1,
            priority=1,
        )

        FacultyPreference.objects.create(
            faculty=self.faculty_2,
            preference_cycle=self.preference_cycle,
            subject=self.subject_2,
            priority=1,
        )

        self.allocation_run = AllocationRun.objects.create(
            name="Test Run",
            academic_year=self.academic_year,
        )

        self.engine = AllocationEngine()

    def test_allocates_all_offerings_and_completes(self):
        result = self.engine.run(
            allocation_run=self.allocation_run,
            preference_cycle=self.preference_cycle,
        )

        self.allocation_run.refresh_from_db()

        self.assertEqual(result["total_offerings"], 3)
        self.assertEqual(result["allocated"], 3)
        self.assertEqual(result["unallocated"], 0)
        self.assertEqual(
            self.allocation_run.status,
            AllocationRun.Status.COMPLETED,
        )
        self.assertEqual(
            SubjectAllocation.objects.filter(
                allocation_run=self.allocation_run,
            ).count(),
            3,
        )

    def test_distributes_workload_fairly_by_lowest_current_workload(self):
        """
        With two equally-eligible faculty and three offerings for
        the same subject, no single faculty member should receive
        every offering - the engine must spread the load.
        """

        self.engine.run(
            allocation_run=self.allocation_run,
            preference_cycle=self.preference_cycle,
        )

        allocations = SubjectAllocation.objects.filter(
            allocation_run=self.allocation_run,
        )

        faculty_ids = set(
            allocations.values_list("faculty_id", flat=True)
        )

        self.assertEqual(
            len(faculty_ids),
            2,
            "Both eligible faculty should receive at least one "
            "allocation instead of one faculty getting everything.",
        )

    def test_no_eligible_faculty_records_conflict_with_breakdown(self):
        Faculty.objects.all().update(is_active=False)

        self.engine.run(
            allocation_run=self.allocation_run,
            preference_cycle=self.preference_cycle,
        )

        conflicts = AllocationConflict.objects.filter(
            allocation_run=self.allocation_run,
        )

        self.assertEqual(conflicts.count(), 3)

        for conflict in conflicts:
            self.assertEqual(
                conflict.conflict_type,
                AllocationConflict.ConflictType.NO_ELIGIBLE_FACULTY,
            )
            self.assertIn("rejection_breakdown", conflict.details)

    def test_failed_run_status_persists_after_exception(self):
        """
        A run that raises mid-execution must end up FAILED in the
        database, not stuck at RUNNING, even though the allocation
        work itself is wrapped in a transaction that gets rolled
        back.
        """

        def boom(*args, **kwargs):
            raise RuntimeError("simulated failure")

        self.engine.allocate_offering = boom

        with self.assertRaises(RuntimeError):
            self.engine.run(
                allocation_run=self.allocation_run,
                preference_cycle=self.preference_cycle,
            )

        self.allocation_run.refresh_from_db()

        self.assertEqual(
            self.allocation_run.status,
            AllocationRun.Status.FAILED,
        )
        self.assertTrue(self.allocation_run.error_message)

    def test_workload_maximum_is_respected(self):
        WorkloadPreference.objects.create(
            faculty=self.faculty_1,
            preference_cycle=self.preference_cycle,
            minimum_hours=0,
            preferred_hours=4,
            maximum_hours=4,
        )

        SubjectAllocation.objects.create(
            allocation_run=self.allocation_run,
            subject_offering=self.offering_a1,
            faculty=self.faculty_1,
            section=self.section_a,
            day=SubjectAllocation.Day.MONDAY,
            slot_number=1,
            workload_hours=4,
        )

        checker = AllocationConflictChecker()

        conflict = checker.check_workload(
            faculty=self.faculty_1,
            additional_hours=4,
            preference_cycle=self.preference_cycle,
            allocation_run=self.allocation_run,
        )

        self.assertIsNotNone(conflict)
        self.assertEqual(
            conflict["conflict_type"],
            AllocationConflict.ConflictType.FACULTY_OVERLOAD,
        )


class WorkloadDashboardViewTests(APITestCase):

    def setUp(self):
        self.academic_year, self.department, self.semester = (
            build_academic_tree()
        )

        self.designation = Designation.objects.create(
            name="Test Designation",
        )

        self.faculty = Faculty.objects.create(
            employee_id="T100",
            first_name="Dash",
            last_name="Board",
            email="dashboard@example.com",
            department=self.department,
            designation=self.designation,
            joining_date=date(2020, 1, 1),
            max_workload_hours=18,
        )

        self.user = User.objects.create_user(
            username="tester",
            password="testpass123",
        )

        self.client.force_authenticate(user=self.user)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(
            "/api/allocation/workload-dashboard/"
        )

        self.assertEqual(response.status_code, 401)

    def test_returns_workload_for_active_faculty(self):
        response = self.client.get(
            "/api/allocation/workload-dashboard/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["faculty_name"],
            "Dash Board",
        )
        self.assertEqual(response.data[0]["current_hours"], 0)
        # No WorkloadPreference row exists for this faculty/cycle,
        # so minimum_hours defaults to 0 - 0 current hours is
        # therefore WITHIN_RANGE, not UNDERLOADED.
        self.assertEqual(response.data[0]["status"], "WITHIN_RANGE")
