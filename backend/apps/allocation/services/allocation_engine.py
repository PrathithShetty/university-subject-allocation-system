from django.db import transaction
from django.utils import timezone

from apps.academics.models import SubjectOffering
from apps.allocation.models import (
    AllocationConflict,
    AllocationRun,
    SubjectAllocation,
)
from apps.allocation.services.conflict_checker import (
    AllocationConflictChecker,
)
from apps.allocation.services.scoring import AllocationScorer
from apps.allocation.services.workload import WorkloadCalculator
from apps.preferences.models import PreferenceCycle
from apps.staff.models import Faculty


class AllocationEngine:
    """
    Main service responsible for generating faculty subject allocations.

    The engine:
        1. Retrieves active subject offerings.
        2. Finds candidate faculty.
        3. Generates possible timetable slots.
        4. Rejects candidates violating hard constraints.
        5. Scores valid candidates.
        6. Selects the highest-scoring candidate.
        7. Creates SubjectAllocation records.
        8. Records conflicts when an offering cannot be allocated.
    """

    DAYS = [
        SubjectAllocation.Day.MONDAY,
        SubjectAllocation.Day.TUESDAY,
        SubjectAllocation.Day.WEDNESDAY,
        SubjectAllocation.Day.THURSDAY,
        SubjectAllocation.Day.FRIDAY,
        SubjectAllocation.Day.SATURDAY,
    ]

    SLOT_NUMBERS = range(1, 9)

    def __init__(self):
        self.scorer = AllocationScorer()
        self.workload_calculator = WorkloadCalculator()
        self.conflict_checker = AllocationConflictChecker()

    @transaction.atomic
    def run(
        self,
        allocation_run,
        preference_cycle,
    ):
        """
        Executes the complete allocation process.

        Returns a summary containing allocation and conflict counts.
        """

        allocation_run.status = AllocationRun.Status.RUNNING
        allocation_run.started_at = timezone.now()
        allocation_run.error_message = ""
        allocation_run.save(
            update_fields=[
                "status",
                "started_at",
                "error_message",
                "updated_at",
            ]
        )

        try:
            offerings = (
                SubjectOffering.objects
                .filter(is_active=True)
                .select_related(
                    "subject",
                    "section",
                    "section__semester",
                )
            )

            total_offerings = offerings.count()
            allocated_count = 0
            conflict_count = 0

            for offering in offerings:
                result = self.allocate_offering(
                    allocation_run=allocation_run,
                    preference_cycle=preference_cycle,
                    subject_offering=offering,
                )

                if result["allocated"]:
                    allocated_count += 1
                else:
                    conflict_count += result["conflict_count"]

            allocation_run.status = AllocationRun.Status.COMPLETED
            allocation_run.completed_at = timezone.now()
            allocation_run.save(
                update_fields=[
                    "status",
                    "completed_at",
                    "updated_at",
                ]
            )

            return {
                "allocation_run_id": allocation_run.id,
                "status": allocation_run.status,
                "total_offerings": total_offerings,
                "allocated": allocated_count,
                "unallocated": total_offerings - allocated_count,
                "conflicts": conflict_count,
            }

        except Exception as exc:
            allocation_run.status = AllocationRun.Status.FAILED
            allocation_run.completed_at = timezone.now()
            allocation_run.error_message = str(exc)
            allocation_run.save(
                update_fields=[
                    "status",
                    "completed_at",
                    "error_message",
                    "updated_at",
                ]
            )

            raise

    def allocate_offering(
        self,
        allocation_run,
        preference_cycle,
        subject_offering,
    ):
        """
        Finds and creates the best valid allocation for one
        subject offering.
        """

        subject = subject_offering.subject
        section = subject_offering.section

        faculty_candidates = (
            Faculty.objects
            .filter(
                is_active=True,
                department=section.semester.program.department,
            )
            .select_related(
                "department",
                "designation",
            )
        )

        candidates = []

        for faculty in faculty_candidates:
            for day in self.DAYS:
                for slot_number in self.SLOT_NUMBERS:

                    workload_hours = (
                        self.workload_calculator.get_subject_workload(
                            subject
                        )
                    )

                    conflicts = (
                        self.conflict_checker.check_all(
                            faculty=faculty,
                            subject_offering=subject_offering,
                            section=section,
                            allocation_run=allocation_run,
                            day=day,
                            slot_number=slot_number,
                            additional_hours=workload_hours,
                        )
                    )

                    if conflicts:
                        continue

                    current_workload = (
                        self.workload_calculator.get_current_workload(
                            faculty=faculty,
                            allocation_run=allocation_run,
                        )
                    )

                    score = self.scorer.calculate_total_score(
                        faculty=faculty,
                        subject=subject,
                        section=section,
                        day=day,
                        slot_number=slot_number,
                        preference_cycle=preference_cycle,
                        current_workload=current_workload,
                    )

                    candidates.append(
                        {
                            "faculty": faculty,
                            "day": day,
                            "slot_number": slot_number,
                            "workload_hours": workload_hours,
                            "score": score,
                        }
                    )

        if not candidates:
            self.create_no_faculty_conflict(
                allocation_run=allocation_run,
                subject_offering=subject_offering,
            )

            return {
                "allocated": False,
                "conflict_count": 1,
            }

        candidates.sort(
            key=lambda candidate: (
                candidate["score"]["total_score"],
                -self.workload_calculator.get_current_workload(
                    candidate["faculty"],
                    allocation_run,
                ),
            ),
            reverse=True,
        )

        best_candidate = candidates[0]

        self.create_allocation(
            allocation_run=allocation_run,
            subject_offering=subject_offering,
            section=section,
            candidate=best_candidate,
        )

        return {
            "allocated": True,
            "conflict_count": 0,
        }

    def create_allocation(
        self,
        allocation_run,
        subject_offering,
        section,
        candidate,
    ):
        """
        Creates the final SubjectAllocation record.
        """

        score = candidate["score"]

        preference_matched = (
            score["subject_score"] > 0
            or score["section_score"] > 0
            or score["time_slot_score"] > 0
        )

        SubjectAllocation.objects.create(
            allocation_run=allocation_run,
            subject_offering=subject_offering,
            faculty=candidate["faculty"],
            section=section,
            day=candidate["day"],
            slot_number=candidate["slot_number"],
            status=SubjectAllocation.Status.PROPOSED,
            preference_score=score["total_score"],
            workload_hours=candidate["workload_hours"],
            is_preference_matched=preference_matched,
            is_conflict_free=True,
            notes=(
                f"Subject score: {score['subject_score']}; "
                f"Section score: {score['section_score']}; "
                f"Time slot score: {score['time_slot_score']}; "
                f"Workload score: {score['workload_score']}"
            ),
        )

    def create_no_faculty_conflict(
        self,
        allocation_run,
        subject_offering,
    ):
        """
        Records a conflict when no valid faculty candidate exists.
        """

        AllocationConflict.objects.create(
            allocation_run=allocation_run,
            conflict_type=(
                AllocationConflict.ConflictType.NO_ELIGIBLE_FACULTY
            ),
            severity=AllocationConflict.Severity.CRITICAL,
            status=AllocationConflict.Status.OPEN,
            message=(
                f"No eligible faculty could be found for "
                f"{subject_offering.subject.code} "
                f"({subject_offering.section})."
            ),
            details={
                "subject_offering_id": subject_offering.id,
                "subject_id": subject_offering.subject.id,
                "section_id": subject_offering.section.id,
            },
        )