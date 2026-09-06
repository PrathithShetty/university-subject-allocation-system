from collections import Counter

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
from apps.staff.models import Faculty


class AllocationEngine:
    """
    Main service responsible for generating faculty subject allocations.

    The engine:
        1. Retrieves active subject offerings.
        2. Finds eligible faculty.
        3. Generates possible timetable slots.
        4. Rejects candidates violating hard constraints.
        5. Calculates preference scores.
        6. Prioritizes faculty with lower current workload.
        7. Uses preference score when workload is equal.
        8. Creates SubjectAllocation records.
        9. Records conflicts when an offering cannot be allocated.
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

    def run(
        self,
        allocation_run,
        preference_cycle,
    ):
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
            with transaction.atomic():
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

        except Exception as exc:
            # The `with transaction.atomic()` block above has already
            # been rolled back at this point (including any COMPLETED
            # status write), so this save runs in its own transaction
            # and is the row's final, persisted state.
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

        return {
            "allocation_run_id": allocation_run.id,
            "status": allocation_run.status,
            "total_offerings": total_offerings,
            "allocated": allocated_count,
            "unallocated": total_offerings - allocated_count,
            "conflicts": conflict_count,
        }

    def allocate_offering(
        self,
        allocation_run,
        preference_cycle,
        subject_offering,
    ):
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

        if not faculty_candidates.exists():
            self.create_no_faculty_conflict(
                allocation_run=allocation_run,
                subject_offering=subject_offering,
                reason_summary=(
                    "There are no active faculty in this offering's "
                    "department."
                ),
            )

            return {
                "allocated": False,
                "conflict_count": 1,
            }

        candidates = []
        rejection_counts = Counter()

        for faculty in faculty_candidates:
            workload_hours = (
                self.workload_calculator.get_subject_workload(
                    subject
                )
            )

            for day in self.DAYS:
                for slot_number in self.SLOT_NUMBERS:

                    conflicts = (
                        self.conflict_checker.check_all(
                            faculty=faculty,
                            subject_offering=subject_offering,
                            section=section,
                            allocation_run=allocation_run,
                            day=day,
                            slot_number=slot_number,
                            additional_hours=workload_hours,
                            preference_cycle=preference_cycle,
                        )
                    )

                    if conflicts:
                        for conflict in conflicts:
                            rejection_counts[
                                conflict["conflict_type"]
                            ] += 1

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
                            "current_workload": current_workload,
                        }
                    )

        if not candidates:
            self.create_no_faculty_conflict(
                allocation_run=allocation_run,
                subject_offering=subject_offering,
                reason_summary=self._summarize_rejections(
                    rejection_counts
                ),
                rejection_counts=dict(rejection_counts),
            )

            return {
                "allocated": False,
                "conflict_count": 1,
            }

        # Fairness-first selection:
        #
        # 1. Faculty with the LOWEST current workload
        #    are considered first.
        #
        # 2. If multiple faculty have the same workload,
        #    the faculty with the HIGHEST preference score wins.
        #
        # 3. If both workload and score are equal,
        #    the candidate ordering remains deterministic.
        candidates.sort(
            key=lambda candidate: (
                candidate["current_workload"],
                -candidate["score"]["total_score"],
                candidate["faculty"].id,
                candidate["day"],
                candidate["slot_number"],
            )
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

    def _summarize_rejections(self, rejection_counts):
        """
        Turns the tally of hard-constraint failures collected while
        searching for a candidate into a human-readable explanation
        of why the offering could not be allocated.
        """

        if not rejection_counts:
            return "No eligible faculty could be found."

        reason_labels = {
            AllocationConflict.ConflictType.FACULTY_OVERLOAD: (
                "would exceed their maximum teaching workload"
            ),
            AllocationConflict.ConflictType.FACULTY_UNAVAILABLE: (
                "were unavailable in every slot checked"
            ),
            AllocationConflict.ConflictType.SCHEDULE_CONFLICT: (
                "already had a conflicting class in every slot "
                "checked"
            ),
            AllocationConflict.ConflictType.SECTION_CONFLICT: (
                "found the section already booked in every slot "
                "checked"
            ),
            AllocationConflict.ConflictType.DUPLICATE_ALLOCATION: (
                "this offering already has an allocation in this run"
            ),
        }

        dominant_type, _ = rejection_counts.most_common(1)[0]

        return (
            "All candidate faculty "
            f"{reason_labels.get(dominant_type, 'were rejected by hard constraints')}."
        )

    def create_no_faculty_conflict(
        self,
        allocation_run,
        subject_offering,
        reason_summary="No eligible faculty could be found.",
        rejection_counts=None,
    ):
        AllocationConflict.objects.create(
            allocation_run=allocation_run,
            conflict_type=(
                AllocationConflict.ConflictType.NO_ELIGIBLE_FACULTY
            ),
            severity=AllocationConflict.Severity.CRITICAL,
            status=AllocationConflict.Status.OPEN,
            message=(
                f"No eligible faculty could be assigned for "
                f"{subject_offering.subject.code} "
                f"({subject_offering.section}). {reason_summary}"
            ),
            details={
                "subject_offering_id": subject_offering.id,
                "subject_id": subject_offering.subject.id,
                "section_id": subject_offering.section.id,
                "rejection_breakdown": rejection_counts or {},
            },
        )