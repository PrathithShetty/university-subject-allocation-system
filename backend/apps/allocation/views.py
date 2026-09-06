from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.models import AcademicYear
from apps.allocation.models import AllocationRun
from apps.allocation.serializers import (
    AllocationConflictSerializer,
    AllocationRunSerializer,
    SubjectAllocationSerializer,
)
from apps.allocation.services import AllocationEngine
from apps.allocation.services.workload import WorkloadCalculator
from apps.preferences.models import PreferenceCycle
from apps.staff.models import Faculty


class AllocationRunListCreateView(APIView):
    """
    Lists existing allocation runs and creates new allocation runs.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        runs = (
            AllocationRun.objects
            .select_related("academic_year")
            .order_by("-created_at")
        )

        serializer = AllocationRunSerializer(
            runs,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = AllocationRunSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        allocation_run = serializer.save()

        return Response(
            AllocationRunSerializer(
                allocation_run,
            ).data,
            status=status.HTTP_201_CREATED,
        )


class AllocationRunDetailView(APIView):
    """
    Retrieves a single allocation run.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        allocation_run = get_object_or_404(
            AllocationRun.objects.select_related(
                "academic_year",
            ),
            pk=pk,
        )

        serializer = AllocationRunSerializer(
            allocation_run,
        )

        return Response(serializer.data)


class AllocationRunExecuteView(APIView):
    """
    Executes the allocation engine for an allocation run.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        allocation_run = get_object_or_404(
            AllocationRun,
            pk=pk,
        )

        if allocation_run.status == AllocationRun.Status.RUNNING:
            return Response(
                {
                    "detail": (
                        "This allocation run is already running."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        preference_cycle_id = request.data.get(
            "preference_cycle",
        )

        if not preference_cycle_id:
            return Response(
                {
                    "detail": (
                        "preference_cycle is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        preference_cycle = get_object_or_404(
            PreferenceCycle,
            pk=preference_cycle_id,
        )

        if (
            preference_cycle.status
            != PreferenceCycle.Status.OPEN
        ):
            return Response(
                {
                    "detail": (
                        "The selected preference cycle "
                        "is not open."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            preference_cycle.academic_year_id
            != allocation_run.academic_year_id
        ):
            return Response(
                {
                    "detail": (
                        "The preference cycle and allocation "
                        "run must belong to the same academic year."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        engine = AllocationEngine()

        try:
            result = engine.run(
                allocation_run=allocation_run,
                preference_cycle=preference_cycle,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": "Allocation failed.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            result,
            status=status.HTTP_200_OK,
        )


class AllocationListView(APIView):
    """
    Returns all subject allocations belonging
    to a specific allocation run.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        allocation_run = get_object_or_404(
            AllocationRun,
            pk=pk,
        )

        allocations = (
            allocation_run.subject_allocations
            .select_related(
                "faculty",
                "section",
                "subject_offering__subject",
            )
            .order_by(
                "section",
                "day",
                "slot_number",
            )
        )

        serializer = SubjectAllocationSerializer(
            allocations,
            many=True,
        )

        return Response(serializer.data)


class AllocationConflictListView(APIView):
    """
    Returns all conflicts belonging
    to a specific allocation run.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        allocation_run = get_object_or_404(
            AllocationRun,
            pk=pk,
        )

        conflicts = (
            allocation_run.conflicts
            .select_related(
                "faculty",
            )
            .order_by(
                "-created_at",
            )
        )

        serializer = AllocationConflictSerializer(
            conflicts,
            many=True,
        )

        return Response(serializer.data)


class WorkloadDashboardView(APIView):
    """
    Returns the current workload status of every active faculty
    member, optionally scoped to a preference cycle (for the
    minimum/preferred/maximum hours) and/or a single allocation
    run (for which allocations count toward the current hours).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        preference_cycle = None
        preference_cycle_id = request.query_params.get(
            "preference_cycle"
        )

        if preference_cycle_id:
            preference_cycle = get_object_or_404(
                PreferenceCycle,
                pk=preference_cycle_id,
            )

        allocation_run = None
        allocation_run_id = request.query_params.get(
            "allocation_run"
        )

        if allocation_run_id:
            allocation_run = get_object_or_404(
                AllocationRun,
                pk=allocation_run_id,
            )

        calculator = WorkloadCalculator()

        faculties = (
            Faculty.objects
            .filter(is_active=True)
            .select_related("department", "designation")
            .order_by("first_name", "last_name")
        )

        results = []

        for faculty in faculties:
            summary = calculator.get_workload_status(
                faculty=faculty,
                preference_cycle=preference_cycle,
                allocation_run=allocation_run,
            )

            results.append(
                {
                    "faculty_id": faculty.id,
                    "faculty_name": faculty.full_name,
                    "department": (
                        faculty.department.name
                        if faculty.department
                        else None
                    ),
                    **summary,
                }
            )

        return Response(results)