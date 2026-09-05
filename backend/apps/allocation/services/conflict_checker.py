from apps.allocation.models import (
    AllocationConflict,
    SubjectAllocation,
)
from apps.allocation.services.workload import WorkloadCalculator


class AllocationConflictChecker:
    """
    Checks hard constraints before a faculty member is assigned
    to a subject offering.
    """

    def __init__(self):
        self.workload_calculator = WorkloadCalculator()

    def check_faculty_availability(
        self,
        faculty,
        day,
        slot_number,
    ):
        availability = (
            faculty.availabilities
            .filter(
                day=day,
                slot_number=slot_number,
            )
            .first()
        )

        if availability is None:
            return None

        if not availability.is_available:
            return {
                "conflict_type": (
                    AllocationConflict.ConflictType.FACULTY_UNAVAILABLE
                ),
                "severity": (
                    AllocationConflict.Severity.ERROR
                ),
                "message": (
                    f"{faculty.full_name} is unavailable on "
                    f"{day} during slot {slot_number}."
                ),
                "details": {
                    "faculty_id": faculty.id,
                    "day": day,
                    "slot_number": slot_number,
                },
            }

        return None

    def check_workload(
        self,
        faculty,
        additional_hours,
        preference_cycle=None,
        allocation_run=None,
    ):
        is_within_limit = (
            self.workload_calculator.is_within_maximum(
                faculty=faculty,
                additional_hours=additional_hours,
                preference_cycle=preference_cycle,
                allocation_run=allocation_run,
            )
        )

        if not is_within_limit:
            workload = (
                self.workload_calculator.get_workload_status(
                    faculty=faculty,
                    preference_cycle=preference_cycle,
                    allocation_run=allocation_run,
                )
            )

            return {
                "conflict_type": (
                    AllocationConflict.ConflictType.FACULTY_OVERLOAD
                ),
                "severity": (
                    AllocationConflict.Severity.ERROR
                ),
                "message": (
                    f"{faculty.full_name} would exceed "
                    f"their maximum teaching workload."
                ),
                "details": workload,
            }

        return None

    def check_duplicate_allocation(
        self,
        allocation_run,
        subject_offering,
        section,
    ):
        exists = SubjectAllocation.objects.filter(
            allocation_run=allocation_run,
            subject_offering=subject_offering,
            section=section,
        ).exclude(
            status=SubjectAllocation.Status.REJECTED,
        ).exists()

        if exists:
            return {
                "conflict_type": (
                    AllocationConflict.ConflictType.DUPLICATE_ALLOCATION
                ),
                "severity": (
                    AllocationConflict.Severity.ERROR
                ),
                "message": (
                    "This subject offering and section already "
                    "have an allocation in this run."
                ),
                "details": {
                    "subject_offering_id": subject_offering.id,
                    "section_id": section.id,
                },
            }

        return None

    def check_faculty_schedule_conflict(
        self,
        faculty,
        day,
        slot_number,
        allocation_run,
    ):
        exists = SubjectAllocation.objects.filter(
            allocation_run=allocation_run,
            faculty=faculty,
            day=day,
            slot_number=slot_number,
        ).exclude(
            status=SubjectAllocation.Status.REJECTED,
        ).exists()

        if exists:
            return {
                "conflict_type": (
                    AllocationConflict.ConflictType.SCHEDULE_CONFLICT
                ),
                "severity": (
                    AllocationConflict.Severity.ERROR
                ),
                "message": (
                    f"{faculty.full_name} already has a subject "
                    f"assigned on {day}, slot {slot_number}."
                ),
                "details": {
                    "faculty_id": faculty.id,
                    "day": day,
                    "slot_number": slot_number,
                },
            }

        return None

    def check_section_schedule_conflict(
        self,
        section,
        day,
        slot_number,
        allocation_run,
    ):
        exists = SubjectAllocation.objects.filter(
            allocation_run=allocation_run,
            section=section,
            day=day,
            slot_number=slot_number,
        ).exclude(
            status=SubjectAllocation.Status.REJECTED,
        ).exists()

        if exists:
            return {
                "conflict_type": (
                    AllocationConflict.ConflictType.SECTION_CONFLICT
                ),
                "severity": (
                    AllocationConflict.Severity.ERROR
                ),
                "message": (
                    f"{section} already has another subject "
                    f"assigned on {day}, slot {slot_number}."
                ),
                "details": {
                    "section_id": section.id,
                    "day": day,
                    "slot_number": slot_number,
                },
            }

        return None

    def check_all(
        self,
        faculty,
        subject_offering,
        section,
        allocation_run,
        day,
        slot_number,
        additional_hours,
        preference_cycle=None,
    ):
        conflicts = []

        duplicate_conflict = self.check_duplicate_allocation(
            allocation_run=allocation_run,
            subject_offering=subject_offering,
            section=section,
        )

        if duplicate_conflict:
            conflicts.append(duplicate_conflict)

        workload_conflict = self.check_workload(
            faculty=faculty,
            additional_hours=additional_hours,
            preference_cycle=preference_cycle,
            allocation_run=allocation_run,
        )

        if workload_conflict:
            conflicts.append(workload_conflict)

        availability_conflict = self.check_faculty_availability(
            faculty=faculty,
            day=day,
            slot_number=slot_number,
        )

        if availability_conflict:
            conflicts.append(availability_conflict)

        faculty_schedule_conflict = (
            self.check_faculty_schedule_conflict(
                faculty=faculty,
                day=day,
                slot_number=slot_number,
                allocation_run=allocation_run,
            )
        )

        if faculty_schedule_conflict:
            conflicts.append(faculty_schedule_conflict)

        section_schedule_conflict = (
            self.check_section_schedule_conflict(
                section=section,
                day=day,
                slot_number=slot_number,
                allocation_run=allocation_run,
            )
        )

        if section_schedule_conflict:
            conflicts.append(section_schedule_conflict)

        return conflicts

    def is_valid(
        self,
        faculty,
        subject_offering,
        section,
        allocation_run,
        day,
        slot_number,
        additional_hours,
        preference_cycle=None,
    ):
        conflicts = self.check_all(
            faculty=faculty,
            subject_offering=subject_offering,
            section=section,
            allocation_run=allocation_run,
            day=day,
            slot_number=slot_number,
            additional_hours=additional_hours,
            preference_cycle=preference_cycle,
        )

        return len(conflicts) == 0