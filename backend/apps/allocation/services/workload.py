from django.db.models import Sum

from apps.allocation.models import SubjectAllocation
from apps.staff.models import Faculty


class WorkloadCalculator:
    """
    Calculates faculty teaching workload from subject allocations.

    The current system uses subject credits as the workload unit.
    """

    def get_current_workload(
        self,
        faculty: Faculty,
        allocation_run=None,
    ) -> int:
        """
        Returns the total workload currently assigned to a faculty
        member.
        """

        allocations = SubjectAllocation.objects.filter(
            faculty=faculty,
        ).exclude(
            status=SubjectAllocation.Status.REJECTED,
        )

        if allocation_run is not None:
            allocations = allocations.filter(
                allocation_run=allocation_run,
            )

        total_hours = allocations.aggregate(
            total=Sum("workload_hours"),
        )["total"]

        return total_hours or 0

    def get_subject_workload(
        self,
        subject,
    ) -> int:
        """
        Uses the subject's credits as its workload value.
        """

        return subject.credits

    def get_remaining_capacity(
        self,
        faculty: Faculty,
        preference_cycle=None,
        allocation_run=None,
    ) -> int:
        """
        Returns remaining workload capacity for the selected
        preference cycle.
        """

        current_workload = self.get_current_workload(
            faculty=faculty,
            allocation_run=allocation_run,
        )

        preference = None

        if preference_cycle is not None:
            preference = (
                faculty.workload_preferences
                .filter(
                    preference_cycle=preference_cycle,
                )
                .first()
            )

        if preference is None:
            maximum_hours = faculty.max_workload_hours
        else:
            maximum_hours = preference.maximum_hours

        return max(
            maximum_hours - current_workload,
            0,
        )

    def is_within_maximum(
        self,
        faculty: Faculty,
        additional_hours: int,
        preference_cycle=None,
        allocation_run=None,
    ) -> bool:
        """
        Checks whether additional workload can be assigned
        without exceeding the maximum workload for the selected
        preference cycle.
        """

        current_workload = self.get_current_workload(
            faculty=faculty,
            allocation_run=allocation_run,
        )

        preference = None

        if preference_cycle is not None:
            preference = (
                faculty.workload_preferences
                .filter(
                    preference_cycle=preference_cycle,
                )
                .first()
            )

        if preference is None:
            maximum_hours = faculty.max_workload_hours
        else:
            maximum_hours = preference.maximum_hours

        return (
            current_workload + additional_hours
            <= maximum_hours
        )

    def get_workload_status(
        self,
        faculty: Faculty,
        preference_cycle=None,
        allocation_run=None,
    ) -> dict:
        """
        Returns a workload summary for the selected preference cycle.
        """

        current_workload = self.get_current_workload(
            faculty=faculty,
            allocation_run=allocation_run,
        )

        preference = None

        if preference_cycle is not None:
            preference = (
                faculty.workload_preferences
                .filter(
                    preference_cycle=preference_cycle,
                )
                .first()
            )

        if preference is None:
            minimum_hours = 0
            preferred_hours = faculty.max_workload_hours
            maximum_hours = faculty.max_workload_hours
        else:
            minimum_hours = preference.minimum_hours
            preferred_hours = preference.preferred_hours
            maximum_hours = preference.maximum_hours

        if current_workload > maximum_hours:
            status = "OVERLOADED"
        elif current_workload >= preferred_hours:
            status = "PREFERRED"
        elif current_workload >= minimum_hours:
            status = "WITHIN_RANGE"
        else:
            status = "UNDERLOADED"

        return {
            "faculty_id": faculty.id,
            "current_hours": current_workload,
            "minimum_hours": minimum_hours,
            "preferred_hours": preferred_hours,
            "maximum_hours": maximum_hours,
            "remaining_capacity": max(
                maximum_hours - current_workload,
                0,
            ),
            "status": status,
        }